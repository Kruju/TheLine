import type { EntryKind, LineId, WritableLineId } from './types';

export interface LineDef {
  id: LineId;
  name: string;
  direction: string;
  tagline: string;
}

export const LINES: LineDef[] = [
  {
    id: 'input',
    name: 'Input',
    direction: 'outside → in',
    tagline: 'What you read, watch and listen to, plus what you think about it.',
  },
  {
    id: 'journal',
    name: 'Journal',
    direction: 'inside → out',
    tagline: 'Your own thoughts, ideas and feelings.',
  },
  {
    id: 'ai',
    name: 'Companion',
    direction: 'connecting',
    tagline: 'An AI that reads what you share and links what you can’t.',
  },
];

export interface KindDef {
  label: string;
  glyph: string;
  /** Which optional fields the composer shows for this kind. */
  fields: { title?: boolean; quote?: boolean; url?: boolean };
}

export const KINDS: Record<WritableLineId, Partial<Record<EntryKind, KindDef>>> = {
  input: {
    highlight: { label: 'Highlight', glyph: '❝', fields: { title: true, quote: true, url: true } },
    article: { label: 'Article', glyph: '▤', fields: { title: true, quote: true, url: true } },
    video: { label: 'Video', glyph: '▶', fields: { title: true, url: true } },
    book: { label: 'Book', glyph: '▮', fields: { title: true, quote: true } },
    podcast: { label: 'Podcast', glyph: '◉', fields: { title: true, url: true } },
    note: { label: 'Note', glyph: '✎', fields: { title: true, url: true } },
  },
  journal: {
    thought: { label: 'Thought', glyph: '◌', fields: {} },
    idea: { label: 'Idea', glyph: '✦', fields: { title: true } },
    feeling: { label: 'Feeling', glyph: '♡', fields: {} },
  },
};

export function kindDef(line: WritableLineId, kind: EntryKind): KindDef {
  return KINDS[line][kind] ?? { label: kind, glyph: '•', fields: { title: true } };
}

/** Journal entries are private by default; input entries are shared. */
export const DEFAULT_AI_VISIBLE: Record<WritableLineId, boolean> = { input: true, journal: false };

export const DEFAULT_KIND: Record<WritableLineId, EntryKind> = { input: 'highlight', journal: 'thought' };
