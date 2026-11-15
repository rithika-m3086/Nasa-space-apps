import { beforeEach, describe, expect, it } from 'vitest';
import { events } from '../src/data/events.js';
import { runGhost } from '../src/engine/index.js';
import { selectDebrief, useMission } from '../src/store/useMission.js';

function finishStoreMission() {
  let turns = 0;
  while (useMission.getState().status === 'running' && turns < 14) {
    turns += 1;
    useMission.getState().autoBalance();
    useMission.getState().lockAllocation();
    let state = useMission.getState();
    if (state.status !== 'running') break;
    const option = state.event.options.find((item) => item.tag === 'balanced')
      || state.event.options.find((item) => item.tag === 'safe');
    useMission.getState().chooseOption(option.id);
    state = useMission.getState();
    if (state.status === 'running') useMission.getState().nextDay();
  }
  return useMission.getState();
}

describe('mission ghost and rewind', () => {
  beforeEach(() => useMission.getState().resetMission());

  it('replays the same seeded mission deterministically', () => {
    const config = { site: 'mars', difficulty: 'commander', seed: 'ghost-repeatable' };
    const first = runGhost(config);
    expect(runGhost(config)).toEqual(first);
    expect(first).toHaveLength(7);
    expect(Object.keys(first[0])).toEqual(['day', 'power', 'life', 'shield', 'science']);
  });

  it('survives at least 95% of 500 seeds for each site and difficulty', () => {
    for (const site of ['moon', 'mars']) {
      for (const difficulty of ['cadet', 'commander']) {
        let survived = 0;
        for (let seed = 0; seed < 500; seed += 1) {
          const series = runGhost({ site, difficulty, seed: `ghost-${site}-${difficulty}-${seed}` });
          if (series.length === 7 && series[6].life > 0) survived += 1;
        }
        expect(survived).toBeGreaterThanOrEqual(475);
      }
    }
  }, 30_000);

  it('rewinds with one fewer token and reproduces the same choices', () => {
    const config = { site: 'moon', difficulty: 'cadet', seed: 'rewind-replay' };
    useMission.getState().startMission(config);
    const original = finishStoreMission();
    expect(original.endReason).toBe('complete');

    useMission.getState().rewindTo(4);
    const rewound = useMission.getState();
    expect(rewound.day).toBe(4);
    expect(rewound.dayLog.map((entry) => entry.day)).toEqual([1, 2, 3]);
    expect(rewound.rewindTokens).toBe(1);
    expect(rewound.profile.missionsPlayed).toBe(original.profile.missionsPlayed);
    expect(rewound.config.seed).toBe(config.seed);

    const replay = finishStoreMission();
    expect(replay.dayLog).toEqual(original.dayLog);
  });

  it('keeps state intact and shows a kid-level tip when no tokens remain', () => {
    useMission.setState({ rewindTokens: 0 });
    const before = useMission.getState();
    useMission.getState().rewindTo(1);
    const after = useMission.getState();

    expect(after.day).toBe(before.day);
    expect(after.gauges).toEqual(before.gauges);
    expect(after.dayLog).toEqual(before.dayLog);
    expect(after.rewindTokens).toBe(0);
    expect(after.lastOutcome.capcom).toMatch(/No rewinds left/);
  });

  it('compares next-day gauges for up to three lessons and always adds one positive lesson', () => {
    useMission.getState().startMission({ site: 'moon', seed: 'lesson-check' });
    const completed = finishStoreMission();
    const balancedLogs = completed.dayLog.map((entry) => {
      const event = events.find((item) => item.id === entry.eventId);
      return {
        ...entry,
        optionId: event.options.find((option) => option.tag === 'balanced').id,
      };
    });
    const noDifference = selectDebrief({ ...completed, dayLog: balancedLogs });
    expect(noDifference.lessons).toHaveLength(1);
    expect(noDifference.lessons[0].text).toMatch(/kept learning/);

    const riskyLogs = balancedLogs.map((entry, index) => {
      const event = events.find((item) => item.id === entry.eventId);
      const risky = event.options.find((option) => option.tag === 'risky');
      return {
        ...entry,
        optionId: risky.id,
        ...(index > 0 ? { gauges: { power: 0, life: 0, shield: 0 } } : {}),
      };
    });
    const debrief = selectDebrief({ ...completed, dayLog: riskyLogs });
    expect(debrief.lessons).toHaveLength(4);
    expect(debrief.lessons[0].day).toBe(2);
    expect(debrief.lessons[3].text).toMatch(/kept learning/);
    expect(noDifference.ghostSeries).toEqual(runGhost(completed.config, balancedLogs));
  });
});
