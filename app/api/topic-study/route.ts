import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findPrebuiltTopic } from '@/lib/prebuiltTopics';

// In-memory cache for custom topics analyzed during the server lifecycle
const serverTopicCache = new Map<string, any>();

const TOPIC_SYSTEM_PROMPT = `You are a world-class, deeply scholarly and spiritually enriching Bible study assistant helping Christians explore foundational biblical themes and topics.

For each topic provided, return a JSON object with this EXACT structure:
{
  "overview": "A comprehensive, highly detailed 4-5 paragraph theological overview covering: (1) Biblical definition & core premise, (2) Covenantal & redemptive context, (3) Key theological doctrines associated with this topic, and (4) Its systemic importance across the whole story of Scripture.",
  "keyScriptures": [
    {
      "reference": "Book Chapter:Verse(s)",
      "text": "The full, actual scripture text (ESV or NIV)",
      "significance": "In-depth explanation of how this passage establishes or deepens the doctrine/theme.",
      "category": "Category name (e.g. 'Old Testament Law', 'Wisdom & Psalms', 'Prophets', 'Gospels', 'Pauline Epistles', 'General Epistles & Revelation')"
    }
  ],
  "wordStudy": [
    {
      "word": "Original Hebrew/Aramaic or Greek word in its original script (e.g. חֶסֶד or χάρις)",
      "englishWord": "English translation / rendering",
      "transliteration": "Accurate transliteration (e.g. chesed or charis)",
      "definition": "Exhaustive lexical definition, root meanings, and theological weight.",
      "strongsNumber": "H1234 or G1234",
      "usage": "Exhaustive analysis of how this specific word is used in Scripture in relation to the topic."
    }
  ],
  "theologicalDevelopment": "A rich, multi-paragraph (4-5 paragraphs) narrative of progressive revelation tracing the topic chronologically: (1) Creation & Patriarchal Era, (2) Law, Sacrificial System & Kingdom, (3) Prophetic Promises, (4) Christological Fulfillment in Jesus and the Gospels, and (5) Apostolic Teaching & New Creation Eschatology.",
  "practicalApplication": "A comprehensive, highly actionable 4-5 paragraph breakdown of practical Christian living: personal reflection, spiritual disciplines, communal fellowship, ethical conduct, and prayerful response.",
  "scholarlyPerspectives": [
    {
      "author": "Scholar / Church Father / Reformer / Theologian Name (e.g., Augustine, John Calvin, Charles Spurgeon, Matthew Henry, N.T. Wright, C.S. Lewis, Herman Bavinck)",
      "source": "Commentary or theological work title",
      "text": "A rich, profound theological insight or quote directly explaining this topic."
    }
  ]
}

Strict Requirements for Depth & Completeness:
- Always return valid JSON only — no markdown formatting, no trailing commas.
- PROVIDE AT LEAST 10 TO 14 KEY SCRIPTURES in "keyScriptures". They MUST cover diverse parts of the Bible (Torah, Prophets/Psalms, Gospels, Pauline Epistles, General Epistles/Revelation).
- PROVIDE AT LEAST 6 TO 10 ORIGINAL LANGUAGE WORDS in "wordStudy", covering both Hebrew (OT) and Greek (NT) root terms.
- PROVIDE AT LEAST 5 SCHOLARLY PERSPECTIVES in "scholarlyPerspectives" from respected historical theologians and commentators across church history.
- Ensure all scripture quotes are accurate and full (not truncated).
- Be scholarly, exhaustive in scope, historically grounded, and spiritually inspiring.`;

// Retry with exponential backoff for 429 or 5xx errors
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || '';
      const statusCode = error?.status || error?.statusCode;
      const isRateLimit =
        statusCode === 429 ||
        errorMessage.includes('429') ||
        errorMessage.includes('ResourceExhausted') ||
        errorMessage.includes('Quota exceeded');
      const isServerError =
        (statusCode >= 500) ||
        errorMessage.includes('500') ||
        errorMessage.includes('Internal server error');

      if ((!isRateLimit && !isServerError) || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// Helper to sanitize and parse JSON response text, removing any markdown code blocks
function cleanAndParseJSON(text: string): any {
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```[a-zA-Z]*\s*/, '');
    cleanText = cleanText.replace(/\s*```$/, '');
  }
  return JSON.parse(cleanText.trim());
}

// Helper to call OpenRouter API using a free model as a fallback if Gemini rate limits or quotas are exceeded.
async function callOpenRouterFallback(userMessage: string): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not configured.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openRouterKey}`,
      'HTTP-Referer': 'https://dividing.vercel.app',
      'X-Title': 'Dividing Bible Study',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: TOPIC_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `OpenRouter returned status ${response.status}`;
    throw new Error(`OpenRouter Fallback Failed: ${message}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter returned an empty response.');
  }
  return content;
}

export async function POST(req: NextRequest) {
  let topic = '';

  try {
    const body = await req.json();
    topic = (body?.topic || '').trim();

    if (!topic || typeof topic !== 'string' || topic.length < 3) {
      return NextResponse.json(
        { error: 'Please provide a valid Bible topic (at least 3 characters).' },
        { status: 400 }
      );
    }

    if (topic.length > 200) {
      return NextResponse.json(
        { error: 'Topic is too long. Please limit to 200 characters.' },
        { status: 400 }
      );
    }

    const normalizedKey = topic.toLowerCase();

    // 1. Check instant pre-built topics database (<20ms response time)
    const prebuiltResult = findPrebuiltTopic(topic);
    if (prebuiltResult) {
      console.log(`[Topic Study] Returning instant prebuilt study for: "${topic}"`);
      return NextResponse.json(prebuiltResult);
    }

    // 2. Check server in-memory cache for custom topics
    if (serverTopicCache.has(normalizedKey)) {
      console.log(`[Topic Study] Returning cached study for: "${topic}"`);
      return NextResponse.json(serverTopicCache.get(normalizedKey));
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid API key. Please configure GEMINI_API_KEY in your environment variables (or .env.local locally).' },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: TOPIC_SYSTEM_PROMPT,
    });

    const userMessage = `Please provide an exhaustive, deeply comprehensive Bible topic study for the following topic:\n\n${topic}`;

    const completion = await withRetry(() =>
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        } as any,
      })
    );

    const content = completion.response.text();

    if (!content) {
      throw new Error('No content received from Gemini model');
    }

    const result = cleanAndParseJSON(content);

    // Save to server cache for instant future lookups
    serverTopicCache.set(normalizedKey, result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Topic Study API error:', error);

    const errorMessage = error?.message || '';
    const statusCode = error?.status || error?.statusCode;
    const isQuotaError =
      statusCode === 429 ||
      errorMessage.includes('ResourceExhausted') ||
      errorMessage.includes('Quota exceeded') ||
      errorMessage.includes('429');

    // Attempt OpenRouter fallback if Gemini is rate-limited/quota-exhausted
    if (isQuotaError && topic) {
      if (process.env.OPENROUTER_API_KEY) {
        console.log('Gemini rate limit exceeded. Attempting OpenRouter (openrouter/free) fallback...');
        try {
          const fallbackContent = await callOpenRouterFallback(`Please provide an exhaustive Bible topic study for: ${topic}`);
          const result = cleanAndParseJSON(fallbackContent);
          serverTopicCache.set(topic.toLowerCase(), result);
          return NextResponse.json(result);
        } catch (fallbackError: any) {
          console.error('OpenRouter fallback failed:', fallbackError);
          return NextResponse.json(
            {
              error: `The Gemini API rate limit was exceeded and the OpenRouter fallback failed: ${fallbackError?.message || fallbackError}`,
            },
            { status: 429 }
          );
        }
      } else {
        console.warn('Gemini rate limit exceeded but OPENROUTER_API_KEY is not set.');
      }
    }

    if (errorMessage.includes('API key') || errorMessage.includes('KEY_INVALID') || errorMessage.includes('invalid')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your GEMINI_API_KEY configuration.' },
        { status: 401 }
      );
    }

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            'The Gemini API rate limit or quota has been exceeded. Please configure OPENROUTER_API_KEY in your environment variables for automatic free open-source fallback, or wait a moment before trying again.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate topic study. Please try again.' },
      { status: 500 }
    );
  }
}
