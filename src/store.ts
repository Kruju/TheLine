import { useEffect, useReducer } from 'react';
import type { AppState, Entry, Settings } from './types';

const STORAGE_KEY = 'lifelines.v1';

export type Action =
  | { type: 'save'; entry: Entry }
  | { type: 'delete'; id: string }
  | { type: 'toggleAi'; id: string }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'replaceEntries'; entries: Entry[] };

export const EMPTY_STATE: AppState = { entries: [], settings: {} };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'save': {
      const saved = action.entry;
      const exists = state.entries.some((e) => e.id === saved.id);
      const entries = (exists ? state.entries : [...state.entries, saved]).map((e) => {
        if (e.id === saved.id) return saved;
        // The saved entry's links are the full set; drop links from others that were removed.
        if (e.links.includes(saved.id) && !saved.links.includes(e.id)) {
          return { ...e, links: e.links.filter((l) => l !== saved.id) };
        }
        return e;
      });
      return { ...state, entries };
    }
    case 'delete':
      return {
        ...state,
        entries: state.entries
          .filter((e) => e.id !== action.id)
          .map((e) => (e.links.includes(action.id) ? { ...e, links: e.links.filter((l) => l !== action.id) } : e)),
      };
    case 'toggleAi':
      return {
        ...state,
        entries: state.entries.map((e) => (e.id === action.id ? { ...e, aiVisible: !e.aiVisible } : e)),
      };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'replaceEntries':
      return { ...state, entries: action.entries };
  }
}

/** All entries linked to `id`, in either direction. */
export function linkedIds(entries: Entry[], id: string): string[] {
  const self = entries.find((e) => e.id === id);
  const out = new Set(self?.links ?? []);
  for (const e of entries) if (e.links.includes(id)) out.add(e.id);
  out.delete(id);
  return [...out].filter((l) => entries.some((e) => e.id === l));
}

/** Newest first. Entries tied on occurredAt (same-minute captures) break by most recently saved. */
export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function matchesQuery(entry: Entry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [entry.title, entry.quote, entry.body, entry.sourceUrl, entry.kind]
    .some((field) => field?.toLowerCase().includes(q));
}

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: parsed.settings ?? {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

/** App state, kept in this browser's localStorage. */
export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the app keeps working in memory.
    }
  }, [state]);
  return [state, dispatch] as const;
}
