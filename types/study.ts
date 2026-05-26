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
