import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Entry, WritableLineId } from './types';
import { LINES } from './lines';
import { matchesQuery, sortEntries, useAppState } from './store';
import { sampleEntries, testEntries } from './sample';
import { Carousel } from './components/Carousel';
import { LineView } from './components/LineView';
import { AiLineView } from './components/AiLineView';
import { Overview } from './components/Overview';
import { Composer, type Draft } from './components/Composer';
import { SettingsDialog } from './components/SettingsDialog';

type View = 'lines' | 'overview';

export function App() {
  const [state, dispatch] = useAppState();
  const [view, setView] = useState<View>('lines');
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');
  const [composing, setComposing] = useState<Entry | Draft | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusId, setFocusId] = useState<string>();

  const sorted = useMemo(() => sortEntries(state.entries), [state.entries]);
  const visible = useMemo(() => sorted.filter((e) => matchesQuery(e, query)), [sorted, query]);
  const activeLine = LINES[active];
  const writableLine: WritableLineId = activeLine.id === 'ai' ? 'journal' : activeLine.id;

  const focusEntry = useCallback(
    (entry: Entry) => {
      if (!matchesQuery(entry, query)) setQuery('');
      setView('lines');
      setActive(LINES.findIndex((l) => l.id === entry.line));
      setFocusId(entry.id);
    },
    [query],
  );

  const jumpTo = useCallback(
    (id: string) => {
      const entry = state.entries.find((e) => e.id === id);
      if (entry) focusEntry(entry);
    },
    [state.entries, focusEntry],
  );

  useEffect(() => {
    if (!focusId) return;
    const t = setTimeout(() => setFocusId(undefined), 2400);
    return () => clearTimeout(t);
  }, [focusId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (composing || settingsOpen || view !== 'lines') return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setActive((i) => Math.min(LINES.length - 1, i + 1));
      if (e.key === 'n') {
        e.preventDefault();
        setComposing({ line: writableLine });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [composing, settingsOpen, view, writableLine]);

  const handlers = {
    onEdit: (entry: Entry) => setComposing(entry),
    onToggleAi: (id: string) => dispatch({ type: 'toggleAi', id }),
    onReflect: (entry: Entry) => setComposing({ line: 'journal', links: [entry.id] }),
    onJump: jumpTo,
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          Lifelines
        </h1>
        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything"
          aria-label="Search entries"
        />
        <div className="segmented view-toggle" role="group" aria-label="View">
          <button className={`seg${view === 'lines' ? ' is-on' : ''}`} onClick={() => setView('lines')} aria-pressed={view === 'lines'}>
            Lines
          </button>
          <button className={`seg${view === 'overview' ? ' is-on' : ''}`} onClick={() => setView('overview')} aria-pressed={view === 'overview'}>
            All
          </button>
        </div>
        <button className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Settings" title="Settings">⚙</button>
      </header>

      {view === 'lines' ? (
        <>
          <nav className="tabs" aria-label="Lines">
            {LINES.map((l, i) => (
              <button key={l.id} className={`tab line-${l.id}${i === active ? ' is-on' : ''}`} onClick={() => setActive(i)} aria-current={i === active}>
                <span className="link-dot" aria-hidden="true" />
                {l.name}
                <span className="tab-count">
                  {l.id === 'ai' ? '' : visible.filter((e) => e.line === l.id).length}
                </span>
              </button>
            ))}
          </nav>

          <Carousel active={active} onChange={setActive}>
            {LINES.map((l) =>
              l.id === 'ai' ? (
                <AiLineView key={l.id} line={l} entries={state.entries} />
              ) : (
                <LineView
                  key={l.id}
                  line={l}
                  entries={visible.filter((e) => e.line === l.id)}
                  allEntries={state.entries}
                  birthDate={state.settings.birthDate}
                  focusId={focusId}
                  active={activeLine.id === l.id}
                  searching={!!query.trim()}
                  onNew={() => setComposing({ line: l.id as WritableLineId })}
                  {...handlers}
                />
              ),
            )}
          </Carousel>

          {activeLine.id !== 'ai' && (
            <button className={`fab line-${activeLine.id}`} onClick={() => setComposing({ line: writableLine })} title="New entry (N)">
              + New {activeLine.name.toLowerCase()}
            </button>
          )}
        </>
      ) : (
        <Overview entries={visible} birthDate={state.settings.birthDate} onJump={jumpTo} />
      )}

      {composing && (
        <Composer
          initial={composing}
          entries={state.entries}
          onClose={() => setComposing(null)}
          onSave={(entry) => {
            dispatch({ type: 'save', entry });
            setComposing(null);
            focusEntry(entry);
          }}
          onDelete={(id) => {
            dispatch({ type: 'delete', id });
            setComposing(null);
          }}
        />
      )}

      {settingsOpen && (
        <SettingsDialog
          settings={state.settings}
          entryCount={state.entries.length}
          onChange={(settings) => dispatch({ type: 'settings', settings })}
          onLoadSample={() => {
            const ids = new Set(state.entries.map((e) => e.id));
            dispatch({ type: 'replaceEntries', entries: [...state.entries, ...sampleEntries().filter((e) => !ids.has(e.id))] });
            setSettingsOpen(false);
          }}
          onLoadTestData={() => {
            const ids = new Set(state.entries.map((e) => e.id));
            dispatch({ type: 'replaceEntries', entries: [...state.entries, ...testEntries().filter((e) => !ids.has(e.id))] });
            if (!state.settings.birthDate) dispatch({ type: 'settings', settings: { birthDate: '1994-01-15' } });
            setSettingsOpen(false);
          }}
          onErase={() => dispatch({ type: 'replaceEntries', entries: [] })}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
