import type { Entry } from '../types';
import type { LineDef } from '../lines';

const PLANNED = [
  ['Threads', 'Suggests links between what you consumed and what you wrote, across months.'],
  ['Themes', 'Notices ideas you keep coming back to, and ones you dropped.'],
  ['On this day', 'Brings back what you were reading and thinking a year ago.'],
  ['Reflections', 'A weekly summary, with every claim pointing back to your own entries.'],
  ['Ask', 'Chat with your own history: “what have I learned about sleep?”'],
];

export function AiLineView({ line, entries }: { line: LineDef; entries: Entry[] }) {
  const shared = entries.filter((e) => e.aiVisible).length;
  // Links are stored on both sides of a pair, so count distinct pairs, not raw references.
  const linkPairs = new Set(
    entries.flatMap((e) => e.links.map((id) => [e.id, id].sort().join('|'))),
  );
  const links = linkPairs.size;

  return (
    <div className="line-view line-ai">
      <header className="line-head">
        <p className="line-direction">{line.direction}</p>
        <h2>{line.name}</h2>
        <p className="line-tagline">{line.tagline}</p>
      </header>

      <div className="ai-stats">
        <div><strong>{shared}</strong><span>shared with the AI</span></div>
        <div><strong>{entries.length - shared}</strong><span>kept private</span></div>
        <div><strong>{links}</strong><span>links you drew</span></div>
      </div>

      <p className="ai-note">
        This line comes later. It will only ever read entries marked <em>AI can see</em>. Journal entries are private
        unless you share them.
      </p>

      <ul className="ai-plan">
        {PLANNED.map(([title, text]) => (
          <li key={title}>
            <span className="card-node" aria-hidden="true" />
            <strong>{title}</strong>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
