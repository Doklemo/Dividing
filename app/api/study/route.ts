import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are a deeply knowledgeable Bible study assistant helping Christians understand scripture through contextual, theological, and scholarly explanations.

For each passage provided, return a JSON object with this EXACT structure:
{
  "overview": "A comprehensive 2-3 paragraph theological overview of the passage, covering its meaning, context, and significance",
  "crossReferences": [
    {
      "reference": "Book Chapter:Verse",
      "text": "The actual verse text (ESV or NIV)",
      "connection": "Why this cross-reference connects to the passage being studied"
    }
  ],
  "greekWords": [
    {
      "word": "Greek/Hebrew word in original script (Greek for New Testament, Hebrew for Old Testament)",
      "englishWord": "English word/phrase being translated from the scripture text",
      "transliteration": "English transliteration",
      "definition": "Full lexical definition and theological significance",
      "strongsNumber": "G1234 (Greek) or H1234 (Hebrew)",
      "usage": "How this word is used in the passage's context"
    }
  ],
  "historicalContext": "2-3 paragraphs covering the historical, cultural, geographical, and social background of the passage",
  "commentaries": [
    {
      "author": "Commentator name",
      "source": "Commentary title",
      "text": "A scholarly insight or quote about this passage"
    }
  ]
}

Rules:
- Always return valid JSON only — no markdown, no extra text
- Provide at least 3 cross references
- Include 3-5 key Greek/Hebrew words (Greek words if New Testament, Hebrew words if Old Testament) that are significant in the scripture text
- Include 2-3 commentary perspectives from respected scholars (e.g., Matthew Henry, John Calvin, Charles Spurgeon, N.T. Wright, etc.)
- Be thorough, scholarly, and spiritually enriching`;

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Invalid API key. Please configure GEMINI_API_KEY in .env.local.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { scripture } = body as { scripture: string };

    if (!scripture || typeof scripture !== 'string' || scripture.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a valid scripture passage.' },
        { status: 400 }
      );
    }

    if (scripture.length > 5000) {
      return NextResponse.json(
        { error: 'Scripture passage is too long. Please limit to 5,000 characters.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the model with the system prompt and Google Search grounding enabled
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const userMessage = `Please provide a comprehensive Bible study breakdown for the following scripture:\n\n${scripture.trim()}`;

    const completion = await withRetry(() =>
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
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

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Study API error:', error);

    const errorMessage = error?.message || '';
    if (errorMessage.includes('API key') || errorMessage.includes('KEY_INVALID') || errorMessage.includes('invalid')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your GEMINI_API_KEY in .env.local.' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('ResourceExhausted') || errorMessage.includes('Quota exceeded') || errorMessage.includes('429')) {
      return NextResponse.json(
        {
          error:
            'The Gemini API rate limit or quota has been exceeded. Please wait a moment before trying again, or check your API quotas on Google AI Studio.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate study. Please try again.' },
      { status: 500 }
    );
  }
}
