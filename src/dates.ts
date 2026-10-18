const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day, yyyy-mm-dd. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dayLabel(key: string, now = new Date()): string {
  const today = dayKey(now.toISOString());
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000).toISOString());
  if (key === today) return 'Today';
  if (key === yesterday) return 'Yesterday';
  const d = parseDay(key);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** "Age 31 · week 1,642 of life" for a day, given a yyyy-mm-dd birth date. */
export function lifeLabel(birthDate: string | undefined, key: string): string | undefined {
  if (!birthDate) return undefined;
  const birth = parseDay(birthDate);
  const day = parseDay(key);
  if (day < birth) return undefined;
  let age = day.getFullYear() - birth.getFullYear();
  if (day.getMonth() < birth.getMonth() || (day.getMonth() === birth.getMonth() && day.getDate() < birth.getDate())) {
    age -= 1;
  }
  const week = Math.floor(Math.round((day.getTime() - birth.getTime()) / 86_400_000) / 7) + 1;
  return `Age ${age} · week ${week.toLocaleString()} of life`;
}

/** ISO → value for <input type="datetime-local">. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  return `${dayKey(iso)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

/** Years ago `iso` falls on the same month/day as `now`, or undefined if it isn't a past anniversary. */
export function anniversaryYears(iso: string, now = new Date()): number | undefined {
  const d = new Date(iso);
  if (d.getMonth() !== now.getMonth() || d.getDate() !== now.getDate()) return undefined;
  const years = now.getFullYear() - d.getFullYear();
  return years > 0 ? years : undefined;
}

/** Entries that occurred on this same month/day in a past year. Keeps input order (recent year first, if pre-sorted). */
export function onThisDay<T extends { occurredAt: string }>(items: T[], now = new Date()): T[] {
  return items.filter((item) => anniversaryYears(item.occurredAt, now) !== undefined);
}

/** Groups entries (already sorted) by local day, keeping order. */
export function groupByDay<T extends { occurredAt: string }>(items: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKey(item.occurredAt);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return [...groups];
}
