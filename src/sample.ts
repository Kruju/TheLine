import type { Entry } from './types';

/** A few weeks of example entries so the timeline has something to show. */
export function sampleEntries(now = new Date()): Entry[] {
  const at = (daysAgo: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  /** Same month/day as `now`, `yearsAgo` years back — exercises the "on this day" view. */
  const anniversary = (yearsAgo: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - yearsAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  const base = { updatedAt: now.toISOString(), links: [] as string[] };

  return [
    {
      ...base,
      id: 'sample-anniversary-1y',
      line: 'input',
      kind: 'highlight',
      occurredAt: anniversary(1, 20, 0),
      title: 'Atomic Habits',
      quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
      body: 'Started trying to build a system instead of chasing one more goal.',
      aiVisible: true,
    },
    {
      ...base,
      id: 'sample-anniversary-2y',
      line: 'journal',
      kind: 'thought',
      occurredAt: anniversary(2, 9, 0),
      body: 'Two years ago today: still figuring out what this timeline idea was even for.',
      aiVisible: false,
    },
    {
      ...base,
      id: 'sample-seneca',
      line: 'input',
      kind: 'highlight',
      occurredAt: at(18, 21, 10),
      title: 'Seneca, Letters from a Stoic',
      quote: 'We suffer more often in imagination than in reality.',
      body: 'Most of my stress last month was about things that never happened.',
      aiVisible: true,
    },
    {
      ...base,
      id: 'sample-worry',
      line: 'journal',
      kind: 'feeling',
      occurredAt: at(16, 7, 40),
      body: 'Woke up anxious about the presentation again. Reminded myself of the Seneca line. Helped a bit.',
      links: ['sample-seneca'],
      aiVisible: false,
    },
    {
      ...base,
      id: 'sample-video',
      line: 'input',
      kind: 'video',
      occurredAt: at(11, 19, 5),
      title: 'How memory consolidates during sleep',
      sourceUrl: 'https://www.youtube.com/',
      body: 'Sleep is when the day gets filed away. Maybe my best ideas show up in the morning for a reason.',
      aiVisible: true,
    },
    {
      ...base,
      id: 'sample-idea',
      line: 'journal',
      kind: 'idea',
      occurredAt: at(10, 8, 15),
      title: 'Morning pages',
      body: 'Write for ten minutes before looking at my phone. Capture what the night sorted out.',
      links: ['sample-video'],
      aiVisible: true,
    },
    {
      ...base,
      id: 'sample-thoreau',
      line: 'input',
      kind: 'book',
      occurredAt: at(4, 22, 30),
      title: 'Thoreau, Walden',
      quote: 'Our life is frittered away by detail… Simplify, simplify.',
      body: '',
      aiVisible: true,
    },
    {
      ...base,
      id: 'sample-article',
      line: 'input',
      kind: 'article',
      occurredAt: at(2, 13, 0),
      title: 'The case for doing fewer things',
      sourceUrl: 'https://example.com/fewer-things',
      body: 'Same message as Walden, 170 years later.',
      links: ['sample-thoreau'],
      aiVisible: true,
    },
    {
      ...base,
      id: 'sample-thought',
      line: 'journal',
      kind: 'thought',
      occurredAt: at(1, 23, 0),
      body: 'I keep coming back to the same idea: less input, more reflection. The morning pages are working.',
      links: ['sample-article', 'sample-idea'],
      aiVisible: false,
    },
    {
      ...base,
      id: 'sample-today',
      line: 'journal',
      kind: 'thought',
      occurredAt: at(0, 9, 20),
      body: 'Quiet morning. Started sketching the timeline app on paper.',
      aiVisible: false,
    },
  ];
}

/**
 * The entries created by hand while manually testing every entry kind and
 * cross-line link. Kept as code (not transferred between browsers) so
 * loading it works regardless of which browser/profile you're in.
 */
export function testEntries(now = new Date()): Entry[] {
  const at = (hour: number, minute: number, second = 0) => {
    const d = new Date(now);
    d.setHours(hour, minute, second, 0);
    return d.toISOString();
  };
  const updatedAt = (hour: number, minute: number, second: number) => at(hour, minute, second);

  return [
    {
      id: 'test-thinking-in-systems',
      line: 'input',
      kind: 'highlight',
      occurredAt: at(10, 10),
      updatedAt: updatedAt(10, 16, 31),
      title: 'Thinking in Systems',
      quote: "A system's behavior cannot be known just by knowing the elements of which the system is made.",
      body: 'This connects to how I think about org design at work.',
      sourceUrl: 'https://example.com/thinking-in-systems',
      links: ['test-why-we-sleep'],
      aiVisible: true,
    },
    {
      id: 'test-why-we-sleep',
      line: 'input',
      kind: 'article',
      occurredAt: at(10, 11),
      updatedAt: updatedAt(10, 11, 38),
      title: 'Why We Sleep — chapter on dreams',
      body: '',
      links: ['test-thinking-in-systems'],
      aiVisible: true,
    },
    {
      id: 'test-kurzgesagt',
      line: 'input',
      kind: 'video',
      occurredAt: at(10, 11),
      updatedAt: updatedAt(10, 12, 15),
      title: 'Kurzgesagt — The Egg',
      body: 'Reframed how I think about identity across a lifetime.',
      sourceUrl: 'https://youtube.com/watch?v=h6fcK_fRYaI',
      links: [],
      aiVisible: true,
    },
    {
      id: 'test-midnight-library',
      line: 'input',
      kind: 'book',
      occurredAt: at(10, 13),
      updatedAt: updatedAt(10, 13, 59),
      title: 'The Midnight Library',
      body: 'Every life contains many potential futures.',
      links: [],
      aiVisible: true,
    },
    {
      id: 'test-huberman',
      line: 'input',
      kind: 'podcast',
      occurredAt: at(10, 13),
      updatedAt: updatedAt(10, 14, 8),
      title: 'Huberman Lab — Focus Toolkit',
      body: 'The 90-minute ultradian rhythm point is worth testing.',
      links: [],
      aiVisible: true,
    },
    {
      id: 'test-walk-note',
      line: 'input',
      kind: 'note',
      occurredAt: at(10, 14),
      updatedAt: updatedAt(10, 14, 20),
      body: 'Random thought: most of my best ideas happen on walks, not at the desk.',
      links: [],
      aiVisible: true,
    },
    {
      id: 'test-scattered',
      line: 'journal',
      kind: 'thought',
      occurredAt: at(10, 14),
      updatedAt: updatedAt(10, 14, 46),
      body: 'Feeling a bit scattered today, too many open threads at once.',
      links: [],
      aiVisible: false,
    },
    {
      id: 'test-zoom-idea',
      line: 'journal',
      kind: 'idea',
      occurredAt: at(10, 15),
      updatedAt: updatedAt(10, 15, 32),
      body: "What if the app's zoom levels mirrored the systems-thinking idea of nested loops — each zoom level is a different feedback loop.",
      links: [],
      aiVisible: true,
    },
    {
      id: 'test-carousel-proud',
      line: 'journal',
      kind: 'feeling',
      occurredAt: at(10, 15),
      updatedAt: updatedAt(10, 15, 43),
      body: 'Proud of getting the carousel feeling smooth today.',
      links: [],
      aiVisible: false,
    },
  ];
}
