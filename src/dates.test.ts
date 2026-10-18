import { describe, expect, it } from 'vitest';
import { dayLabel, groupByDay, lifeLabel } from './dates';

describe('lifeLabel', () => {
  it('gives age and week of life', () => {
    expect(lifeLabel('1995-06-15', '1995-06-15')).toBe('Age 0 · week 1 of life');
    expect(lifeLabel('1995-06-15', '1995-06-22')).toBe('Age 0 · week 2 of life');
    expect(lifeLabel('1995-06-15', '2026-06-14')).toMatch(/^Age 30 /);
    expect(lifeLabel('1995-06-15', '2026-06-15')).toMatch(/^Age 31 /);
  });

  it('is empty without a birth date or before birth', () => {
    expect(lifeLabel(undefined, '2026-01-01')).toBeUndefined();
    expect(lifeLabel('2000-01-01', '1999-12-31')).toBeUndefined();
  });
});

describe('dayLabel', () => {
  it('names today and yesterday', () => {
    const now = new Date(2026, 9, 18, 12);
    expect(dayLabel('2026-10-18', now)).toBe('Today');
    expect(dayLabel('2026-10-17', now)).toBe('Yesterday');
  });
});

describe('groupByDay', () => {
  it('groups in order', () => {
    const at = (d: number, h: number) => ({ occurredAt: new Date(2026, 0, d, h).toISOString() });
    const groups = groupByDay([at(3, 9), at(3, 8), at(2, 20)]);
    expect(groups.map(([, items]) => items.length)).toEqual([2, 1]);
  });
});
