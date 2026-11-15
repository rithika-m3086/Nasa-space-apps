import { beforeEach, describe, expect, it } from 'vitest';
import { fixtureDebrief, fixtureStickerCatalog } from '../src/data/fixtures.js';
import { sources } from '../src/data/sources.js';
import { getMissionHistory } from '../src/engine/index.js';
import { useMission } from '../src/store/useMission.js';

const stateFields = [
  'status',
  'step',
  'config',
  'day',
  'gauges',
  'science',
  'sunlight',
  'dust',
  'energyToday',
  'available',
  'allocation',
  'event',
  'lastOutcome',
  'crew',
  'dayLog',
  'safeModeAvailable',
  'rewindTokens',
  'endReason',
  'rank',
  'live',
  'profile',
];

describe('mission store', () => {
  beforeEach(() => useMission.getState().resetMission());

  it('starts with the contract-shaped mission state', () => {
    const state = useMission.getState();
    const dataKeys = Object.keys(state).filter((key) => typeof state[key] !== 'function').sort();

    expect(dataKeys).toEqual([...stateFields].sort());
    expect(state).toMatchObject({
      status: 'running',
      step: 'allocate',
      day: 1,
      config: { site: 'moon', difficulty: 'cadet' },
      gauges: { power: 60, life: 80, shield: 75 },
      available: state.gauges.power + state.energyToday,
    });
    expect(state.crew).toHaveLength(3);
    expect(state.crew.every((member) => ['Brave', 'Curious', 'Funny', 'Careful'].includes(member.trait))).toBe(true);
    expect(fixtureStickerCatalog).toHaveLength(16);
    expect(state.profile.stickers).toEqual([]);
    expect(fixtureDebrief.humanSeries).toHaveLength(7);
    expect(fixtureDebrief.ghostSeries).toHaveLength(7);
    expect(fixtureDebrief.lessons).toHaveLength(3);
    expect(fixtureDebrief.radiation.refs).toHaveLength(3);
    expect(fixtureDebrief.radiation.refs.every((ref) => sources.some((source) => source.id === ref.sourceId))).toBe(true);
  });

  it('keeps allocation in five-point steps within available energy', () => {
    const state = useMission.getState();
    state.adjustAllocation('science', 100);
    const after = useMission.getState();
    const spent = Object.values(after.allocation).reduce((total, value) => total + value, 0);

    expect(after.allocation.science % 5).toBe(0);
    expect(spent).toBeLessThanOrEqual(after.available);
  });

  it('records resolved days and completes a seven-day mission', () => {
    useMission.getState().startMission({
      site: 'moon',
      difficulty: 'cadet',
      seed: 'store-walkthrough',
    });

    while (useMission.getState().status === 'running') {
      useMission.getState().autoBalance();
      useMission.getState().lockAllocation();
      if (useMission.getState().status === 'ended') break;
      const optionId = useMission.getState().event.options.find((item) => item.tag === 'balanced').id;
      useMission.getState().chooseOption(optionId);
      if (useMission.getState().status === 'running') useMission.getState().nextDay();
    }

    expect(useMission.getState().status).toBe('ended');
    expect(useMission.getState().day).toBe(7);
    expect(useMission.getState().endReason).toBe('complete');
    expect(useMission.getState().dayLog).toHaveLength(7);
    expect(getMissionHistory(useMission.getState()).map((snapshot) => snapshot.day)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });
});
