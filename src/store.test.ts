import { describe, expect, it } from 'vitest';
import type { AppState, Entry } from './types';
import { EMPTY_STATE, linkedIds, matchesQuery, reducer, sortEntries } from './store';

const entry = (id: string, extra: Partial<Entry> = {}): Entry => ({
  id,
  line: 'input',
  kind: 'note',
  occurredAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
  body: '',
  links: [],
  aiVisible: true,
  ...extra,
});

const withEntries = (...entries: Entry[]): AppState => ({ ...EMPTY_STATE, entries });

describe('reducer', () => {
  it('adds and then updates an entry', () => {
    let s = reducer(EMPTY_STATE, { type: 'save', entry: entry('a', { body: 'one' }) });
    s = reducer(s, { type: 'save', entry: entry('a', { body: 'two' }) });
    expect(s.entries).toHaveLength(1);
    expect(s.entries[0].body).toBe('two');
  });

  it('removes reverse links that were dropped on save', () => {
    const s = withEntries(entry('a'), entry('b', { links: ['a'] }), entry('c', { links: ['a'] }));
    // Editing "a" with only "c" linked removes the b → a link.
    const next = reducer(s, { type: 'save', entry: entry('a', { links: ['c'] }) });
    expect(linkedIds(next.entries, 'a').sort()).toEqual(['c']);
    expect(next.entries.find((e) => e.id === 'b')!.links).toEqual([]);
  });

  it('deletes an entry and links pointing at it', () => {
    const s = withEntries(entry('a'), entry('b', { links: ['a'] }));
    const next = reducer(s, { type: 'delete', id: 'a' });
    expect(next.entries.map((e) => e.id)).toEqual(['b']);
    expect(next.entries[0].links).toEqual([]);
  });

  it('toggles AI visibility', () => {
    const next = reducer(withEntries(entry('a')), { type: 'toggleAi', id: 'a' });
    expect(next.entries[0].aiVisible).toBe(false);
  });
});

describe('linkedIds', () => {
  it('treats links as undirected and ignores missing entries', () => {
    const entries = [entry('a', { links: ['b', 'gone'] }), entry('b'), entry('c', { links: ['a'] })];
    expect(linkedIds(entries, 'a').sort()).toEqual(['b', 'c']);
    expect(linkedIds(entries, 'b')).toEqual(['a']);
  });
});

describe('helpers', () => {
  it('sorts newest first', () => {
    const sorted = sortEntries([
      entry('old', { occurredAt: '2025-01-01T00:00:00.000Z' }),
      entry('new', { occurredAt: '2026-01-01T00:00:00.000Z' }),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(['new', 'old']);
  });

  it('searches title, quote and body case-insensitively', () => {
    const e = entry('a', { title: 'Walden', quote: 'Simplify, simplify', body: 'less input' });
    expect(matchesQuery(e, 'walden')).toBe(true);
    expect(matchesQuery(e, 'SIMPLIFY')).toBe(true);
    expect(matchesQuery(e, 'Input')).toBe(true);
    expect(matchesQuery(e, 'sleep')).toBe(false);
    expect(matchesQuery(e, '  ')).toBe(true);
  });
});
