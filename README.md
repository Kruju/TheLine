# Lifelines

A timeline of everything that shapes your thinking, starting at your birth date.
Instead of folders, everything sits on one of three lines:

| Line | Direction | What goes on it |
| --- | --- | --- |
| **Input** | outside → in | Book highlights, articles, videos, podcasts, plus your notes on them |
| **Journal** | inside → out | Your own thoughts, ideas and feelings |
| **Companion** | connecting | An AI that reads only what you share and links what you can't (coming later) |

## What works today

- **Turn between lines**: swipe left/right on touch, or use the tabs, the arrow keys, or a click on a neighbouring line.
- **Scroll through time** within a line, grouped by day, with your age and week of life once a birth date is set.
- **Link entries** across lines. *Reflect on this →* on an input entry starts a journal entry already linked to it.
- **All view**: the three lines side by side, with links drawn as threads between them.
- **Search** across every entry.
- **Privacy per entry**: each entry is either *AI can see* or *Private*. Journal entries start private.
- **Backdate** any entry with its *When* field.

Data lives only in this browser's local storage on this computer. There are no accounts and no network calls.
Settings has *Add sample entries* to try it out and *Erase everything* to start clean.

Keyboard: `←` `→` turn lines, `N` new entry, `Ctrl/⌘ + Enter` save, `Esc` close.

## Run it

Requires Node 20 or newer.

```sh
npm install
npm run dev      # http://localhost:5173
```

```sh
npm test         # unit tests
npm run build    # typecheck + production build into dist/
```

## Code map

- `src/types.ts`: the single `Entry` model. The line is just a field.
- `src/lines.ts`: the three lines and the kinds of entry each accepts.
- `src/store.ts`: state reducer, local storage, link and search helpers.
- `src/components/`: `Carousel` (the turning lines), `LineView`, `Overview`, `Composer`, `EntryCard`, `AiLineView`.
