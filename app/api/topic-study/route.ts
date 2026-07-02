import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TOPIC_SYSTEM_PROMPT = `You are a deeply knowledgeable Bible study assistant helping Christians understand important topics emphasised throughout Scripture.

For each topic provided, return a JSON object with this EXACT structure:
{
  "overview": "A detailed and comprehensive 2-3 paragraph theological overview of the topic, covering its meaning, biblical significance, and importance in Christian theology",
  "keyScriptures": [
    {
      "reference": "Book Chapter:Verse",
      "text": "The actual verse text (ESV or NIV)",
      "significance": "Detailed explanation of why this passage is foundational to understanding this topic"
    }
  ],
  "wordStudy": [
    {
      "word": "Original Hebrew/Greek word in its original script (Hebrew script for OT concepts, Greek script for NT concepts)",
      "englishWord": "English word/phrase being translated",
      "transliteration": "English transliteration",
      "definition": "Full lexical definition and theological significance in-depth",
      "strongsNumber": "H1234 (Hebrew) or G1234 (Greek)",
      "usage": "How this word relates to the topic across Scripture"
    }
  ],
  "theologicalDevelopment": "2-3 detailed paragraphs tracing how this topic develops from the Old Testament through the New Testament, showing the progression and deepening of the concept across Scripture",
  "practicalApplication": "2-3 detailed paragraphs on how this topic applies to daily Christian life, with practical insights grounded in scripture"
}

Rules:
- Always return valid JSON only — no markdown, no extra text
- Provide 5-8 key scripture passages that are foundational to the topic
- Include 3-5 key original language words related to the topic:
  - Use Hebrew words (Hebrew script, Strong's numbers starting with 'H') for Old Testament concepts
  - Use Greek words (Greek script, Strong's numbers starting with 'G') for New Testament concepts
  - For topics that span both testaments, include words from both languages
- The theological development section MUST trace the topic from Genesis through Revelation, showing how the concept evolves
- The practical application MUST be grounded in specific scriptures, not generic advice
- Be thorough, detailed, scholarly, and spiritually enriching`;

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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Invalid API key. Please configure GEMINI_API_KEY in your environment variables (or .env.local locally).' },
      { status: 401 }
    );
  }

  let userMessage = '';

  try {
    const body = await req.json();
    const { topic } = body as { topic: string };

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
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

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: TOPIC_SYSTEM_PROMPT,
    });

    userMessage = `Please provide a comprehensive Bible topic study for the following topic:\n\n${topic.trim()}`;

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
    if (isQuotaError && userMessage) {
      if (process.env.OPENROUTER_API_KEY) {
        console.log('Gemini rate limit exceeded. Attempting OpenRouter (openrouter/free) fallback...');
        try {
          const fallbackContent = await callOpenRouterFallback(userMessage);
          const result = cleanAndParseJSON(fallbackContent);
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
