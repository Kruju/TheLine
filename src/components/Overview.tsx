import { useLayoutEffect, useRef, useState } from 'react';
import type { Entry, LineId } from '../types';
import { LINES, kindDef } from '../lines';
import { dayLabel, groupByDay, lifeLabel } from '../dates';
import { entrySummary } from './EntryCard';

interface Props {
  entries: Entry[];
  birthDate?: string;
  onJump: (id: string) => void;
}

interface Thread {
  key: string;
  d: string;
  line: LineId;
}

/** All three lines side by side, with the links between entries drawn as threads. */
export function Overview({ entries, birthDate, onJump }: Props) {
  const content = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const root = content.current;
    if (!root) return;
    const visible = new Map(entries.map((e) => [e.id, e]));

    const measure = () => {
      const base = root.getBoundingClientRect();
      const rect = (id: string) => root.querySelector(`[data-ov="${CSS.escape(id)}"]`)?.getBoundingClientRect();
      const seen = new Set<string>();
      const next: Thread[] = [];
      for (const e of entries) {
        for (const otherId of e.links) {
          const other = visible.get(otherId);
          const key = [e.id, otherId].sort().join('|');
          if (!other || seen.has(key)) continue;
          seen.add(key);
          const a = rect(e.id);
          const b = rect(otherId);
          if (!a || !b) continue;
          const ay = a.top + a.height / 2 - base.top;
          const by = b.top + b.height / 2 - base.top;
          let d: string;
          if (Math.abs(a.left - b.left) < 4) {
            // Same line: loop out to the right.
            const x = a.right - base.left;
            d = `M${x} ${ay} C${x + 36} ${ay}, ${x + 36} ${by}, ${x} ${by}`;
          } else {
            const ax = (a.left < b.left ? a.right : a.left) - base.left;
            const bx = (a.left < b.left ? b.left : b.right) - base.left;
            const mx = (ax + bx) / 2;
            d = `M${ax} ${ay} C${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
          }
          next.push({ key, d, line: e.line });
        }
      }
      setThreads(next);
      setSize({ w: root.scrollWidth, h: root.scrollHeight });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [entries]);

  const days = groupByDay(entries);

  return (
    <div className="overview">
      <div className="ov-cols ov-heads">
        {LINES.map((l) => (
          <div key={l.id} className={`ov-head line-${l.id}`}>
            <span className="link-dot" aria-hidden="true" />
            {l.name}
          </div>
        ))}
      </div>

      <div className="ov-content" ref={content}>
        <svg className="ov-threads" width={size.w} height={size.h} aria-hidden="true">
          {threads.map((t) => (
            <path key={t.key} d={t.d} className={`thread line-${t.line}`} />
          ))}
        </svg>

        {days.length === 0 && <p className="empty">No entries to show.</p>}

        {days.map(([day, items]) => (
          <section key={day} className="ov-day">
            <h3 className="day-head">
              <span>{dayLabel(day)}</span>
              {lifeLabel(birthDate, day) && <span className="day-life">{lifeLabel(birthDate, day)}</span>}
            </h3>
            <div className="ov-cols">
              {LINES.map((l) => (
                <div key={l.id} className="ov-cell">
                  {items
                    .filter((e) => e.line === l.id)
                    .map((e) => (
                      <button key={e.id} data-ov={e.id} className={`ov-card line-${e.line}`} onClick={() => onJump(e.id)}>
                        <span className="kind-glyph" aria-hidden="true">{kindDef(e.line, e.kind).glyph}</span>
                        <span className="ov-text">{entrySummary(e, 70)}</span>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
