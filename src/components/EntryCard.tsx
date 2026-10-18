import type { Entry } from '../types';
import { kindDef } from '../lines';
import { timeLabel } from '../dates';
import { linkedIds } from '../store';

export function entrySummary(entry: Entry, max = 48): string {
  const text = (entry.title || entry.quote || entry.body || 'Untitled').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      {locked ? <path d="M8 11V7a4 4 0 0 1 8 0v4" /> : <path d="M8 11V7a4 4 0 0 1 7.75-1.5" />}
    </svg>
  );
}

interface Props {
  entry: Entry;
  entries: Entry[];
  focused?: boolean;
  onEdit: (entry: Entry) => void;
  onToggleAi: (id: string) => void;
  onReflect: (entry: Entry) => void;
  onJump: (id: string) => void;
}

export function EntryCard({ entry, entries, focused, onEdit, onToggleAi, onReflect, onJump }: Props) {
  const kind = kindDef(entry.line, entry.kind);
  const links = linkedIds(entries, entry.id)
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is Entry => !!e);

  return (
    <article
      id={`entry-${entry.id}`}
      className={`card line-${entry.line}${focused ? ' is-focused' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onEdit(entry)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEdit(entry))}
    >
      <header className="card-head">
        <span className="kind">
          <span className="kind-glyph" aria-hidden="true">{kind.glyph}</span>
          {kind.label}
        </span>
        <time dateTime={entry.occurredAt}>{timeLabel(entry.occurredAt)}</time>
        <button
          className={`ai-lock${entry.aiVisible ? ' is-open' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleAi(entry.id); }}
          aria-pressed={entry.aiVisible}
          title={entry.aiVisible ? 'Shared with the AI companion. Click to make private.' : 'Private. Click to share with the AI companion.'}
        >
          <LockIcon locked={!entry.aiVisible} />
        </button>
      </header>

      {entry.title && <h3 className="card-title">{entry.title}</h3>}
      {entry.quote && <blockquote className="card-quote">{entry.quote}</blockquote>}
      {entry.body && <p className="card-body">{entry.body}</p>}
      {entry.sourceUrl && (
        <a className="card-source" href={entry.sourceUrl} target="_blank" rel="noreferrer noopener" onClick={(e) => e.stopPropagation()}>
          ↗ {hostname(entry.sourceUrl)}
        </a>
      )}

      {links.length > 0 && (
        <div className="card-links">
          {links.map((l) => (
            <button key={l.id} className={`link-chip line-${l.line}`} onClick={(e) => { e.stopPropagation(); onJump(l.id); }} title="Go to linked entry">
              <span className="link-dot" aria-hidden="true" />
              {entrySummary(l, 36)}
            </button>
          ))}
        </div>
      )}

      {entry.line === 'input' && (
        <footer className="card-actions">
          <button className="text-btn reflect" onClick={(e) => { e.stopPropagation(); onReflect(entry); }}>Reflect on this →</button>
        </footer>
      )}
    </article>
  );
}
