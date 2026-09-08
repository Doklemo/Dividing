export interface GreekWord {
  word: string;
  englishWord?: string;
  transliteration: string;
  definition: string;
  strongsNumber?: string;
  usage?: string;
}

export interface CrossReference {
  reference: string;
  text: string;
  connection: string;
}

export interface Commentary {
  author: string;
  source: string;
  text: string;
}

export interface StudyResult {
  overview: string;
  crossReferences: CrossReference[];
  greekWords: GreekWord[];
  historicalContext: string;
  commentaries: Commentary[];
}

export interface SavedStudy {
  key: string;
  scripture: string;
  result: StudyResult;
  savedAt: string; // ISO timestamp
  snippet: string; // First 120 chars of scripture
}

export type TabId = 'overview' | 'crossReferences' | 'greekWords' | 'historicalContext' | 'commentaries';

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

// ── Topic Study Types ──────────────────────────

export interface KeyScripture {
  reference: string;
  text: string;
  significance: string;
  category?: string;
}

export interface TopicWord {
  word: string;
  englishWord: string;
  transliteration: string;
  definition: string;
  strongsNumber: string;
  usage: string;
}

export interface TopicStudyResult {
  overview: string;
  keyScriptures: KeyScripture[];
  wordStudy: TopicWord[];
  theologicalDevelopment: string;
  practicalApplication: string;
  scholarlyPerspectives?: Commentary[];
}

export type TopicTabId =
  | 'overview'
  | 'keyScriptures'
  | 'wordStudy'
  | 'theologicalDevelopment'
  | 'practicalApplication'
  | 'scholarlyPerspectives';

export interface TopicTab {
  id: TopicTabId;
  label: string;
  icon: string;
}

export type StudyMode = 'verse' | 'topic' | 'bible';

export interface SavedTopicStudy {
  key: string;
  topic: string;
  result: TopicStudyResult;
  savedAt: string;
  snippet: string;
  type: 'topic';
}

// ── Bible Reader Types ──────────────────────────

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapterData {
  translation: string;
  book: string;
  bookId: number;
  chapter: number;
  totalChapters: number;
  verses: BibleVerse[];
}

