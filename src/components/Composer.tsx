import { useMemo, useState, type FormEvent } from 'react';
import type { Entry, EntryKind, WritableLineId } from '../types';
import { DEFAULT_AI_VISIBLE, DEFAULT_KIND, KINDS, LINES, kindDef } from '../lines';
import { fromLocalInput, toLocalInput } from '../dates';
import { linkedIds, matchesQuery, newId, sortEntries } from '../store';
import { entrySummary } from './EntryCard';
import { Modal } from './Modal';

export type Draft = { line: WritableLineId; links?: string[] };

interface Props {
  /** An existing entry to edit, or a draft for a new one. */
  initial: Entry | Draft;
  entries: Entry[];
  onSave: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function Composer({ initial, entries, onSave, onDelete, onClose }: Props) {
  const existing = 'id' in initial ? initial : undefined;
  const [line, setLine] = useState<WritableLineId>(initial.line);
  const [kind, setKind] = useState<EntryKind>(existing?.kind ?? DEFAULT_KIND[initial.line]);
  const [when, setWhen] = useState(toLocalInput(existing?.occurredAt ?? new Date().toISOString()));
  const [title, setTitle] = useState(existing?.title ?? '');
  const [quote, setQuote] = useState(existing?.quote ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [url, setUrl] = useState(existing?.sourceUrl ?? '');
  const [links, setLinks] = useState<string[]>(existing ? linkedIds(entries, existing.id) : (initial.links ?? []));
  const [aiVisible, setAiVisible] = useState(existing?.aiVisible ?? DEFAULT_AI_VISIBLE[initial.line]);
  const [linkQuery, setLinkQuery] = useState('');

  const fields = kindDef(line, kind).fields;
  const lineName = LINES.find((l) => l.id === line)!.name;
  const canSave = [title, quote, body].some((s) => s.trim());

  const candidates = useMemo(
    () =>
      sortEntries(entries)
        .filter((e) => e.id !== existing?.id && !links.includes(e.id) && matchesQuery(e, linkQuery))
        .slice(0, 6),
    [entries, existing?.id, links, linkQuery],
  );

  const switchLine = (next: WritableLineId) => {
    if (next === line) return;
    setLine(next);
    setKind(DEFAULT_KIND[next]);
    if (!existing) setAiVisible(DEFAULT_AI_VISIBLE[next]);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSave) return;
    const clean = (s: string) => s.trim() || undefined;
    onSave({
      id: existing?.id ?? newId(),
      line,
      kind,
      occurredAt: fromLocalInput(when),
      updatedAt: new Date().toISOString(),
      title: fields.title ? clean(title) : undefined,
      quote: fields.quote ? clean(quote) : undefined,
      body: body.trim(),
      sourceUrl: fields.url ? clean(url) : undefined,
      links,
      aiVisible,
    });
  };

  return (
    <Modal title={existing ? 'Edit entry' : `New on ${lineName}`} onClose={onClose}>
      <form
        className={`composer line-${line}`}
        onSubmit={submit}
        onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && submit()}
      >
        <div className="segmented" role="group" aria-label="Line">
          {(['input', 'journal'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={`seg line-${id}${line === id ? ' is-on' : ''}`}
              onClick={() => switchLine(id)}
              aria-pressed={line === id}
            >
              {LINES.find((l) => l.id === id)!.name}
            </button>
          ))}
        </div>

        <div className="kinds" role="group" aria-label="Kind">
          {Object.entries(KINDS[line]).map(([id, def]) => (
            <button
              key={id}
              type="button"
              className={`kind-chip${kind === id ? ' is-on' : ''}`}
              onClick={() => setKind(id as EntryKind)}
              aria-pressed={kind === id}
            >
              <span aria-hidden="true">{def!.glyph}</span> {def!.label}
            </button>
          ))}
        </div>

        {fields.title && (
          <label className="field">
            <span>{line === 'input' ? 'Title or source' : 'Title'}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={line === 'input' ? 'Book, article or video' : 'Optional'} />
          </label>
        )}
        {fields.quote && (
          <label className="field">
            <span>Quote</span>
            <textarea className="quote-input" rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="The exact words that caught you" />
          </label>
        )}
        {fields.url && (
          <label className="field">
            <span>Link</span>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </label>
        )}
        <label className="field">
          <span>{line === 'input' ? 'Your notes' : 'What’s on your mind'}</span>
          <textarea
            rows={line === 'journal' ? 6 : 4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={line === 'input' ? 'Why it matters to you, what it made you think' : 'Write freely…'}
            autoFocus
          />
        </label>

        <div className="field">
          <span>Linked to</span>
          {links.length > 0 && (
            <div className="card-links">
              {links.map((id) => {
                const e = entries.find((x) => x.id === id);
                if (!e) return null;
                return (
                  <button key={id} type="button" className={`link-chip line-${e.line}`} onClick={() => setLinks(links.filter((l) => l !== id))} title="Remove link">
                    <span className="link-dot" aria-hidden="true" />
                    {entrySummary(e, 32)} <span aria-hidden="true">✕</span>
                  </button>
                );
              })}
            </div>
          )}
          <input value={linkQuery} onChange={(e) => setLinkQuery(e.target.value)} placeholder="Search entries to link…" aria-label="Search entries to link" />
          {linkQuery.trim() && (
            <div className="link-results">
              {candidates.length === 0 && <p className="muted">No matches.</p>}
              {candidates.map((e) => (
                <button key={e.id} type="button" className={`link-result line-${e.line}`} onClick={() => { setLinks([...links, e.id]); setLinkQuery(''); }}>
                  <span className="link-dot" aria-hidden="true" />
                  {entrySummary(e, 60)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="composer-row">
          <label className="field when">
            <span>When</span>
            <input type="datetime-local" value={when} onChange={(e) => e.target.value && setWhen(e.target.value)} />
          </label>
          <label className="switch">
            <input type="checkbox" checked={aiVisible} onChange={(e) => setAiVisible(e.target.checked)} />
            <span className="switch-track" aria-hidden="true" />
            <span>{aiVisible ? 'AI can see this' : 'Private'}</span>
          </label>
        </div>

        <footer className="composer-actions">
          {existing && (
            <button
              type="button"
              className="btn danger"
              onClick={() => confirm('Delete this entry? This cannot be undone.') && onDelete(existing.id)}
            >
              Delete
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={!canSave}>Save</button>
        </footer>
      </form>
    </Modal>
  );
}
