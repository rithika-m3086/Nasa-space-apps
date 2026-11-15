import { describe, expect, it } from 'vitest';
import { teacherSummary } from '../src/engine/index.js';

describe('teacher classroom summary', () => {
  it('returns three run-based questions and a next-step suggestion', () => {
    const summary = teacherSummary({
      humanSeries: [
        { day: 1, power: 70, life: 80, shield: 75, science: 0 },
        { day: 2, power: 60, life: 81, shield: 74, science: 5 },
      ],
      ghostSeries: [
        { day: 1, power: 70, life: 80, shield: 75, science: 0 },
        { day: 2, power: 75, life: 77, shield: 70, science: 10 },
      ],
      radiation: {
        refs: [
          { label: 'Mars cruise', msvPerDay: 1.8 },
          { label: 'Mars surface', msvPerDay: 0.67 },
        ],
      },
    });

    expect(summary.questions).toHaveLength(3);
    expect(summary.questions[0]).toContain('Day 2');
    expect(summary.questions[0]).toContain('Power');
    expect(summary.questions[1]).toContain('Ghost');
    expect(summary.questions[2]).toContain('radiation');
    expect(summary.tryNext).toContain('Power');
  });
});
