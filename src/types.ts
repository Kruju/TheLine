/** The three lines of the timeline. */
export type LineId = 'input' | 'journal' | 'ai';

/** Lines the user writes to. The AI line is generated, never written by hand. */
export type WritableLineId = Exclude<LineId, 'ai'>;

export type InputKind = 'highlight' | 'article' | 'video' | 'book' | 'podcast' | 'note';
export type JournalKind = 'thought' | 'idea' | 'feeling';
export type EntryKind = InputKind | JournalKind;

/**
 * One item on the timeline. Every item has the same shape; the line is just a field,
 * so items can move between lines and new lines can be added later.
 */
export interface Entry {
  id: string;
  line: WritableLineId;
  kind: EntryKind;
  /** When it happened (ISO). Can be set in the past to backfill. */
  occurredAt: string;
  updatedAt: string;
  title?: string;
  /** Exact words from the source, e.g. a book highlight. */
  quote?: string;
  /** The user's own words. */
  body: string;
  sourceUrl?: string;
  /** Ids of related entries. Links are undirected: see `linkedIds`. */
  links: string[];
  /** Whether the future AI line may read this entry. */
  aiVisible: boolean;
}

export interface Settings {
  /** yyyy-mm-dd, the start of the timeline. */
  birthDate?: string;
}

export interface AppState {
  entries: Entry[];
  settings: Settings;
}
