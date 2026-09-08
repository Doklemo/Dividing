import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 66 Canonical Bible Books metadata
export interface BookMeta {
  id: number;
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
}

export const BIBLE_BOOKS: BookMeta[] = [
  { id: 1, name: 'Genesis', chapters: 50, testament: 'OT' },
  { id: 2, name: 'Exodus', chapters: 40, testament: 'OT' },
  { id: 3, name: 'Leviticus', chapters: 27, testament: 'OT' },
  { id: 4, name: 'Numbers', chapters: 36, testament: 'OT' },
  { id: 5, name: 'Deuteronomy', chapters: 34, testament: 'OT' },
  { id: 6, name: 'Joshua', chapters: 24, testament: 'OT' },
  { id: 7, name: 'Judges', chapters: 21, testament: 'OT' },
  { id: 8, name: 'Ruth', chapters: 4, testament: 'OT' },
  { id: 9, name: '1 Samuel', chapters: 31, testament: 'OT' },
  { id: 10, name: '2 Samuel', chapters: 24, testament: 'OT' },
  { id: 11, name: '1 Kings', chapters: 22, testament: 'OT' },
  { id: 12, name: '2 Kings', chapters: 25, testament: 'OT' },
  { id: 13, name: '1 Chronicles', chapters: 29, testament: 'OT' },
  { id: 14, name: '2 Chronicles', chapters: 36, testament: 'OT' },
  { id: 15, name: 'Ezra', chapters: 10, testament: 'OT' },
  { id: 16, name: 'Nehemiah', chapters: 13, testament: 'OT' },
  { id: 17, name: 'Esther', chapters: 10, testament: 'OT' },
  { id: 18, name: 'Job', chapters: 42, testament: 'OT' },
  { id: 19, name: 'Psalms', chapters: 150, testament: 'OT' },
  { id: 20, name: 'Proverbs', chapters: 31, testament: 'OT' },
  { id: 21, name: 'Ecclesiastes', chapters: 12, testament: 'OT' },
  { id: 22, name: 'Song of Solomon', chapters: 8, testament: 'OT' },
  { id: 23, name: 'Isaiah', chapters: 66, testament: 'OT' },
  { id: 24, name: 'Jeremiah', chapters: 52, testament: 'OT' },
  { id: 25, name: 'Lamentations', chapters: 5, testament: 'OT' },
  { id: 26, name: 'Ezekiel', chapters: 48, testament: 'OT' },
  { id: 27, name: 'Daniel', chapters: 12, testament: 'OT' },
  { id: 28, name: 'Hosea', chapters: 14, testament: 'OT' },
  { id: 29, name: 'Joel', chapters: 3, testament: 'OT' },
  { id: 30, name: 'Amos', chapters: 9, testament: 'OT' },
  { id: 31, name: 'Obadiah', chapters: 1, testament: 'OT' },
  { id: 32, name: 'Jonah', chapters: 4, testament: 'OT' },
  { id: 33, name: 'Micah', chapters: 7, testament: 'OT' },
  { id: 34, name: 'Nahum', chapters: 3, testament: 'OT' },
  { id: 35, name: 'Habakkuk', chapters: 3, testament: 'OT' },
  { id: 36, name: 'Zephaniah', chapters: 3, testament: 'OT' },
  { id: 37, name: 'Haggai', chapters: 2, testament: 'OT' },
  { id: 38, name: 'Zechariah', chapters: 14, testament: 'OT' },
  { id: 39, name: 'Malachi', chapters: 4, testament: 'OT' },
  { id: 40, name: 'Matthew', chapters: 28, testament: 'NT' },
  { id: 41, name: 'Mark', chapters: 16, testament: 'NT' },
  { id: 42, name: 'Luke', chapters: 24, testament: 'NT' },
  { id: 43, name: 'John', chapters: 21, testament: 'NT' },
  { id: 44, name: 'Acts', chapters: 28, testament: 'NT' },
  { id: 45, name: 'Romans', chapters: 16, testament: 'NT' },
  { id: 46, name: '1 Corinthians', chapters: 16, testament: 'NT' },
  { id: 47, name: '2 Corinthians', chapters: 13, testament: 'NT' },
  { id: 48, name: 'Galatians', chapters: 6, testament: 'NT' },
  { id: 49, name: 'Ephesians', chapters: 6, testament: 'NT' },
  { id: 50, name: 'Philippians', chapters: 4, testament: 'NT' },
  { id: 51, name: 'Colossians', chapters: 4, testament: 'NT' },
  { id: 52, name: '1 Thessalonians', chapters: 5, testament: 'NT' },
  { id: 53, name: '2 Thessalonians', chapters: 3, testament: 'NT' },
  { id: 54, name: '1 Timothy', chapters: 6, testament: 'NT' },
  { id: 55, name: '2 Timothy', chapters: 4, testament: 'NT' },
  { id: 56, name: 'Titus', chapters: 3, testament: 'NT' },
  { id: 57, name: 'Philemon', chapters: 1, testament: 'NT' },
  { id: 58, name: 'Hebrews', chapters: 13, testament: 'NT' },
  { id: 59, name: 'James', chapters: 5, testament: 'NT' },
  { id: 60, name: '1 Peter', chapters: 5, testament: 'NT' },
  { id: 61, name: '2 Peter', chapters: 3, testament: 'NT' },
  { id: 62, name: '1 John', chapters: 5, testament: 'NT' },
  { id: 63, name: '2 John', chapters: 1, testament: 'NT' },
  { id: 64, name: '3 John', chapters: 1, testament: 'NT' },
  { id: 65, name: 'Jude', chapters: 1, testament: 'NT' },
  { id: 66, name: 'Revelation', chapters: 22, testament: 'NT' },
];

function sanitizeHtml(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
}

async function fetchFromBolls(translation: string, bookId: number, chapter: number) {
  const transCode = translation.toUpperCase();
  const url = `https://bolls.life/get-chapter/${transCode}/${bookId}/${chapter}/`;
  
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Bolls API returned status ${res.status}`);
  
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No verses returned from Bolls API');
  }

  return data.map((item: any) => ({
    verse: item.verse,
    text: sanitizeHtml(item.text),
  }));
}

async function fetchFromGeminiAI(translation: string, bookName: string, chapter: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Return the complete text of ${bookName} Chapter ${chapter} in the ${translation} Bible translation.
Return a JSON array of objects with exact keys: "verse" (number) and "text" (string).
Example:
[
  { "verse": 1, "text": "In the beginning..." },
  { "verse": 2, "text": "..." }
]
Return JSON ONLY, no commentary or markdown formatting.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanedText);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((item: any) => ({
      verse: Number(item.verse),
      text: String(item.text).trim(),
    }));
  }
  throw new Error('Failed to parse Gemini response for chapter verses');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const translation = searchParams.get('translation') || 'NKJV';
  const bookParam = searchParams.get('book') || 'John';
  const chapterParam = searchParams.get('chapter') || '3';
  const chapter = parseInt(chapterParam, 10) || 1;

  const bookMeta = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === bookParam.toLowerCase() || b.id === parseInt(bookParam, 10)
  ) || BIBLE_BOOKS.find((b) => b.name === 'John')!;

  const validChapter = Math.min(Math.max(1, chapter), bookMeta.chapters);

  try {
    let verses;
    try {
      verses = await fetchFromBolls(translation, bookMeta.id, validChapter);
    } catch (bollsErr) {
      console.warn('Bolls API failed, falling back to Gemini AI:', bollsErr);
      verses = await fetchFromGeminiAI(translation, bookMeta.name, validChapter);
    }

    return NextResponse.json({
      translation: translation.toUpperCase(),
      book: bookMeta.name,
      bookId: bookMeta.id,
      chapter: validChapter,
      totalChapters: bookMeta.chapters,
      verses,
    });
  } catch (error) {
    console.error('Bible API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Bible chapter' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const translation = body.translation || 'NKJV';
    const bookParam = body.book || 'John';
    const chapterParam = body.chapter || 3;
    const chapter = parseInt(String(chapterParam), 10) || 1;

    const bookMeta = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === bookParam.toLowerCase() || b.id === parseInt(bookParam, 10)
    ) || BIBLE_BOOKS.find((b) => b.name === 'John')!;

    const validChapter = Math.min(Math.max(1, chapter), bookMeta.chapters);

    let verses;
    try {
      verses = await fetchFromBolls(translation, bookMeta.id, validChapter);
    } catch (bollsErr) {
      console.warn('Bolls API failed, falling back to Gemini AI:', bollsErr);
      verses = await fetchFromGeminiAI(translation, bookMeta.name, validChapter);
    }

    return NextResponse.json({
      translation: translation.toUpperCase(),
      book: bookMeta.name,
      bookId: bookMeta.id,
      chapter: validChapter,
      totalChapters: bookMeta.chapters,
      verses,
    });
  } catch (error) {
    console.error('Bible API POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Bible chapter' },
      { status: 500 }
    );
  }
}
