import { useEffect, useRef } from 'react';
import type { Entry } from '../types';
import type { LineDef } from '../lines';
import { dayLabel, groupByDay, lifeLabel } from '../dates';
import { EntryCard } from './EntryCard';
import { OnThisDay } from './OnThisDay';

interface Props {
  line: LineDef;
  entries: Entry[];
  allEntries: Entry[];
  birthDate?: string;
  focusId?: string;
  active: boolean;
  searching: boolean;
  onEdit: (entry: Entry) => void;
  onToggleAi: (id: string) => void;
  onReflect: (entry: Entry) => void;
  onJump: (id: string) => void;
  onNew: () => void;
}

export function LineView(props: Props) {
  const { line, entries, allEntries, birthDate, focusId, active, searching } = props;
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !focusId) return;
    // Wait for the carousel to finish turning before scrolling.
    const t = setTimeout(() => {
      scroller.current
        ?.querySelector(`#entry-${CSS.escape(focusId)}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return () => clearTimeout(t);
  }, [active, focusId]);

  return (
    <div className={`line-view line-${line.id}`} ref={scroller}>
      <header className="line-head">
        <p className="line-direction">{line.direction}</p>
        <h2>{line.name}</h2>
        <p className="line-tagline">{line.tagline}</p>
      </header>

      {!searching && <OnThisDay entries={allEntries} onJump={props.onJump} />}

      {entries.length === 0 ? (
        <div className="empty">
          {searching ? (
            <p>Nothing on this line matches your search.</p>
          ) : (
            <>
              <p>Nothing here yet.</p>
              <button className="btn primary" onClick={props.onNew}>Add the first entry</button>
            </>
          )}
        </div>
      ) : (
        <div className="rail">
          {groupByDay(entries).map(([day, items]) => (
            <section key={day} className="day">
              <h3 className="day-head">
                <span>{dayLabel(day)}</span>
                {lifeLabel(birthDate, day) && <span className="day-life">{lifeLabel(birthDate, day)}</span>}
              </h3>
              {items.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  entries={allEntries}
                  focused={entry.id === focusId}
                  onEdit={props.onEdit}
                  onToggleAi={props.onToggleAi}
                  onReflect={props.onReflect}
                  onJump={props.onJump}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
