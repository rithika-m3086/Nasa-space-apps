import { describe, expect, it } from 'vitest';
import { selectDebrief, useMission } from '../src/store/useMission.js';

const debriefFields = [
  'rank',
  'survived',
  'days',
  'humanSeries',
  'ghostSeries',
  'lessons',
  'radiation',
  'shareCode',
  'stickersEarned',
];

function completeMission(config) {
  useMission.getState().startMission(config);
  let steps = 0;

  while (useMission.getState().status === 'running' && steps < 7) {
    useMission.getState().autoBalance();
    useMission.getState().lockAllocation();
    let state = useMission.getState();
    if (state.status !== 'running') break;

    const option = state.event.options.find((item) => item.tag === 'balanced')
      || state.event.options.find((item) => item.tag === 'safe')
      || state.event.options[0];
    useMission.getState().chooseOption(option.id);
    state = useMission.getState();
    if (state.status === 'running') useMission.getState().nextDay();
    steps += 1;
  }

  return useMission.getState();
}

describe('mission smoke runs', () => {
  it.each([
    { site: 'moon', difficulty: 'cadet', seed: 'smoke-moon-cadet' },
    { site: 'mars', difficulty: 'cadet', seed: 'smoke-mars-cadet' },
    { site: 'mars', difficulty: 'commander', seed: 'smoke-mars-commander' },
  ])('completes a seeded $site $difficulty mission with contract-shaped debrief data', (config) => {
    let state;
    expect(() => {
      state = completeMission({ cadetName: 'Smoke Cadet', mode: 'free', ...config });
    }).not.toThrow();

    expect(state.status).toBe('ended');
    expect(state.endReason).toBe('complete');
    expect(state.dayLog).toHaveLength(7);
    const debrief = selectDebrief(state);
    expect(Object.keys(debrief)).toEqual(expect.arrayContaining(debriefFields));
    expect(debrief.humanSeries).toHaveLength(7);
    expect(debrief.ghostSeries).toHaveLength(7);
    expect(debrief.lessons.every((lesson) => typeof lesson.text === 'string')).toBe(true);
    expect(debrief.radiation).toMatchObject({
      crewDoseMsvPerDay: expect.any(Number),
      refs: expect.any(Array),
    });
    expect(debrief.shareCode).toEqual(expect.any(String));
    expect(debrief.stickersEarned).toEqual(expect.any(Array));
  });
});
