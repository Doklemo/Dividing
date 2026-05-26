import { SavedStudy, StudyResult } from '@/types/study';

const STORAGE_PREFIX = 'dividing_study_';

export function saveStudy(scripture: string, result: StudyResult): SavedStudy {
  const timestamp = new Date().toISOString();
  const key = `${STORAGE_PREFIX}${Date.now()}`;
  const study: SavedStudy = {
    key,
    scripture,
    result,
    savedAt: timestamp,
    snippet: scripture.slice(0, 120),
  };
  try {
    localStorage.setItem(key, JSON.stringify(study));
  } catch (e) {
    console.error('Failed to save study:', e);
  }
  return study;
}

export function getAllStudies(): SavedStudy[] {
  try {
    const studies: SavedStudy[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            studies.push(JSON.parse(raw) as SavedStudy);
          } catch {
            // skip corrupt entries
          }
        }
      }
    }
    return studies.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  } catch {
    return [];
  }
}

export function deleteStudy(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to delete study:', e);
  }
}

export function clearAllStudies(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear studies:', e);
  }
}
