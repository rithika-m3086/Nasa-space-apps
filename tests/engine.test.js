import { describe, expect, it } from 'vitest';
import {
  activateSafeMode,
  applyAllocation,
  createMission,
  endDay,
  lockAllocation,
  resolveOption,
  rewindMission,
} from '../src/engine/index.js';

describe('mission engine', () => {
  it('applies the daily allocation equations and shield-scaled event harm', () => {
    const mission = createMission({ seed: 'equation-check' });
    const allocated = applyAllocation({
      ...mission,
      allocation: { life: 10, shield: 10, science: 10 },
    });

    expect(allocated.gauges).toEqual({ power: 61, life: 76.7, shield: 74.5 });
    expect(allocated.science).toBe(10);
    expect(allocated.available).toBe(allocated.gauges.power + allocated.energyToday);

    const eventState = {
      ...mission,
      step: 'event',
      gauges: { power: 20, life: 80, shield: 50 },
      event: {
        id: 'harm-check',
        why: 'Test event.',
        options: [{
          id: 'harm',
          capcom: 'Take care.',
          shieldScaled: true,
          effects: { power: 0, life: -10, shield: 0, science: 0 },
        }],
      },
    };
    const resolved = resolveOption(eventState, 'harm');
    expect(resolved.gauges.life).toBeCloseTo(74.4);
    expect(resolved.lastOutcome.effects.life).toBeCloseTo(-5.6);
  });

  it('records day-start snapshots, applies safe mode once, and ends at zero life', () => {
    const mission = createMission({ seed: 'history-check' });
    const dayTwo = endDay(lockAllocation({
      ...mission,
      allocation: { life: 0, shield: 0, science: 0 },
    }));
    expect(dayTwo.day).toBe(2);
    const rewound = rewindMission(dayTwo, 1);
    expect(rewound.day).toBe(1);
    expect(rewound.rewindTokens).toBe(mission.rewindTokens - 1);
    expect(rewound.gauges).toEqual(mission.gauges);

    const safe = activateSafeMode({
      ...mission,
      gauges: { power: 10, life: 20, shield: 12 },
    });
    expect(safe.gauges).toEqual({ power: 30, life: 30, shield: 22 });
    expect(activateSafeMode(safe)).toBe(safe);

    const ended = lockAllocation({
      ...mission,
      gauges: { power: 60, life: 10, shield: 75 },
    });
    expect(ended.status).toBe('ended');
    expect(ended.endReason).toBe('life_zero');
  });

  it('assigns the top rank from end-of-mission gauges and science', () => {
    const mission = createMission({ seed: 'rank-check' });
    const completed = endDay({
      ...mission,
      day: 7,
      step: 'report',
      gauges: { power: 70, life: 70, shield: 70 },
      science: 60,
    });

    expect(completed.endReason).toBe('complete');
    expect(completed.rank).toBe('Flight Director');
  });
});
