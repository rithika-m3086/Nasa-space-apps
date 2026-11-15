import { beforeEach, describe, expect, it } from 'vitest';
import { fixtureDebrief, fixtureStickerCatalog, runningStateFixture } from '../src/data/fixtures.js';
import { sources } from '../src/data/sources.js';
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

describe('mission store stub', () => {
  beforeEach(() => useMission.getState().resetMission());

  it('starts with the contract-shaped Moon fixture', () => {
    const state = useMission.getState();
    const dataKeys = Object.keys(state).filter((key) => typeof state[key] !== 'function').sort();

    expect(dataKeys).toEqual([...stateFields].sort());
    expect(state).toMatchObject(runningStateFixture);
    expect(fixtureStickerCatalog).toHaveLength(16);
    expect(state.profile.stickers).toHaveLength(5);
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

  it('records an option and ends after the seventh day', () => {
    const state = useMission.getState();
    state.chooseOption('a');
    expect(useMission.getState().lastOutcome.optionId).toBe('a');
    expect(useMission.getState().step).toBe('report');

    for (let day = 3; day < 7; day += 1) useMission.getState().nextDay();
    useMission.getState().nextDay();
    expect(useMission.getState().status).toBe('ended');
    expect(useMission.getState().day).toBe(7);
  });
});
