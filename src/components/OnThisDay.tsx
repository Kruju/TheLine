import type { Entry } from '../types';
import { kindDef } from '../lines';
import { anniversaryYears, onThisDay } from '../dates';
import { entrySummary } from './EntryCard';

interface Props {
  /** Entries from every line — this surfaces across the whole timeline, not just the line it's shown on. */
  entries: Entry[];
  now?: Date;
  onJump: (id: string) => void;
}

export function OnThisDay({ entries, now = new Date(), onJump }: Props) {
  const items = onThisDay(entries, now);
  if (items.length === 0) return null;

  return (
    <section className="otd">
      <h3 className="otd-head">On this day</h3>
      <div className="otd-list">
        {items.map((entry) => {
          const years = anniversaryYears(entry.occurredAt, now)!;
          const kind = kindDef(entry.line, entry.kind);
          return (
            <button key={entry.id} className={`otd-item line-${entry.line}`} onClick={() => onJump(entry.id)}>
              <span className="otd-years">{years === 1 ? '1 year ago' : `${years} years ago`}</span>
              <span className="otd-glyph" aria-hidden="true">{kind.glyph}</span>
              <span className="otd-text">{entrySummary(entry, 70)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
