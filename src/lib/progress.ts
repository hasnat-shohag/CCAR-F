import { DOMAINS, TOTAL_LESSONS, type DomainId } from './domains';

export const STORAGE_KEY = 'ccarf:v1';

export interface LessonRecord {
  completed: boolean;
  at: string;
}

export interface ProgressState {
  version: 1;
  lessons: Record<string, LessonRecord>;
}

export const LESSON_EVENT = 'ccarf:progress-change';

function emptyState(): ProgressState {
  return { version: 1, lessons: {} };
}

export function loadState(): ProgressState {
  if (typeof localStorage === 'undefined') return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyState();
    const candidate = parsed as Partial<ProgressState>;
    if (candidate.version !== 1 || !candidate.lessons || typeof candidate.lessons !== 'object') {
      return emptyState();
    }
    const lessons: Record<string, LessonRecord> = {};
    for (const [id, value] of Object.entries(candidate.lessons)) {
      if (!value || typeof value !== 'object') continue;
      const record = value as Partial<LessonRecord>;
      lessons[id] = { completed: record.completed === true, at: typeof record.at === 'string' ? record.at : '' };
    }
    return { version: 1, lessons };
  } catch {
    return emptyState();
  }
}

export function saveState(state: ProgressState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode or quota: progress simply does not persist */
  }
  emitChange();
}

export function emitChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LESSON_EVENT));
}

export function isComplete(state: ProgressState, lessonId: string): boolean {
  return state.lessons[lessonId]?.completed === true;
}

export function setLessonComplete(lessonId: string, completed: boolean): ProgressState {
  const state = loadState();
  state.lessons[lessonId] = { completed, at: new Date().toISOString() };
  saveState(state);
  return state;
}

export function completedCount(state: ProgressState): number {
  return Object.values(state.lessons).filter((record) => record.completed).length;
}

export function domainCompleted(state: ProgressState, domain: DomainId): number {
  const meta = DOMAINS.find((item) => item.id === domain);
  if (!meta) return 0;
  let count = 0;
  for (let index = 1; index <= meta.lessons; index += 1) {
    if (isComplete(state, `${domain}-${index}`)) count += 1;
  }
  return count;
}

export function overallPercent(state: ProgressState): number {
  return Math.round((completedCount(state) / TOTAL_LESSONS) * 100);
}

export function domainPercent(state: ProgressState, domain: DomainId): number {
  const meta = DOMAINS.find((item) => item.id === domain);
  if (!meta) return 0;
  return Math.round((domainCompleted(state, domain) / meta.lessons) * 100);
}

export function resetProgress(): void {
  saveState(emptyState());
}
