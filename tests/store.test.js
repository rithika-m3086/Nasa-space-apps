import { beforeEach, describe, expect, it } from 'vitest';
import { fixtureDebrief } from '../src/data/fixtures.js';
import { sources } from '../src/data/sources.js';
import { getDailySeed, getMissionHistory } from '../src/engine/index.js';
import {
  normalizeClassCode,
  parseShareCode,
  selectDebrief,
  selectShouldSuggestBreak,
  selectShareCode,
  selectStickerCatalog,
  useMission,
} from '../src/store/useMission.js';

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
    expect(selectStickerCatalog(state)).toHaveLength(16);
    expect(state.profile.stickers).toEqual([]);
    expect(fixtureDebrief.humanSeries).toHaveLength(7);
    expect(fixtureDebrief.ghostSeries).toHaveLength(7);
    expect(fixtureDebrief.lessons).toHaveLength(3);
    expect(fixtureDebrief.radiation.refs).toHaveLength(3);
    expect(fixtureDebrief.radiation.refs.every((ref) => sources.some((source) => source.id === ref.sourceId))).toBe(true);
  });

  it('persists only the profile under the contract storage key', () => {
    const options = useMission.persist.getOptions();
    const persisted = options.partialize(useMission.getState());
    expect(options.name).toBe('aphelion.v1');
    expect(Object.keys(persisted)).toEqual(['profile']);
    expect(persisted.profile).toEqual(useMission.getState().profile);
  });

  it('suggests a break after three missions or 25 minutes', () => {
    const startedAt = Date.parse('2026-11-15T00:00:00.000Z');
    const state = {
      ...useMission.getState(),
      profile: {
        ...useMission.getState().profile,
        sessionMissions: 1,
        sessionStartedAt: new Date(startedAt).toISOString(),
      },
    };
    expect(selectShouldSuggestBreak(state, startedAt + 24 * 60 * 1000)).toBe(false);
    expect(selectShouldSuggestBreak(state, startedAt + 25 * 60 * 1000)).toBe(true);
    expect(selectShouldSuggestBreak({
      ...state,
      profile: { ...state.profile, sessionMissions: 3 },
    }, startedAt)).toBe(true);
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

  it('uses the same UTC daily seed and gameplay for repeated Daily Missions', () => {
    const playDaily = (seed) => {
      useMission.getState().startMission({
        site: 'moon',
        difficulty: 'cadet',
        mode: 'daily',
        seed,
      });
      while (useMission.getState().status === 'running') {
        useMission.getState().autoBalance();
        useMission.getState().lockAllocation();
        const state = useMission.getState();
        if (state.status !== 'running') break;
        const option = state.event.options.find((item) => item.tag === 'balanced');
        useMission.getState().chooseOption(option.id);
        if (useMission.getState().status === 'running') useMission.getState().nextDay();
      }
      return {
        seed: useMission.getState().config.seed,
        dayLog: useMission.getState().dayLog,
      };
    };

    const first = playDaily('ignored-first-seed');
    expect(useMission.getState().profile.stickers).toContain('daily-explorer');
    const second = playDaily('ignored-second-seed');
    expect(first.seed).toBe(getDailySeed());
    expect(second).toEqual(first);
    expect(useMission.getState().profile.best.moon).toBe(7);
    expect(useMission.getState().profile.stickers).toContain('mission-finisher');
  });

  it('normalizes Class Codes and produces a parseable mission share code', () => {
    expect(normalizeClassCode('  Orion class 42 ')).toBe('ORION-CLASS-42');
    const playClassMission = (seed) => {
      useMission.getState().startMission({
        cadetName: 'Orion 42',
        site: 'mars',
        difficulty: 'commander',
        mode: 'class',
        seed,
      });
      while (useMission.getState().status === 'running') {
        useMission.getState().autoBalance();
        useMission.getState().lockAllocation();
        const state = useMission.getState();
        if (state.status !== 'running') break;
        const option = state.event.options.find((item) => item.tag === 'balanced');
        useMission.getState().chooseOption(option.id);
        if (useMission.getState().status === 'running') useMission.getState().nextDay();
      }
      return useMission.getState();
    };
    const first = playClassMission('  Orion class 42 ');
    expect(first.profile.stickers).toContain('class-pilot');
    const second = playClassMission('orion   class 42');
    expect(first.config.seed).toBe('ORION-CLASS-42');
    expect(second.dayLog).toEqual(first.dayLog);

    const code = selectShareCode({
      ...first,
      dayLog: [{ day: 1, gauges: { power: 50, life: 70, shield: 52 }, science: 10 }],
      science: 10,
      rank: 'Pilot',
    });
    expect(code).toBe('ORION-42|MARS|COMMANDER|D1|S52|SCI10|PILOT');
    expect(parseShareCode(code)).toEqual({
      cadetName: 'ORION-42',
      site: 'mars',
      difficulty: 'commander',
      days: 1,
      shield: 52,
      science: 10,
      rank: 'Pilot',
    });
    expect(parseShareCode('bad-code')).toBeNull();
  });

  it('scales the game radiation estimate from average shield and keeps real references', () => {
    const state = useMission.getState();
    const debrief = selectDebrief({
      ...state,
      gauges: { ...state.gauges, shield: 50 },
      dayLog: [
        { day: 1, gauges: { power: 60, life: 80, shield: 60 }, science: 0 },
        { day: 2, gauges: { power: 55, life: 75, shield: 80 }, science: 5 },
      ],
    });
    expect(debrief.radiation.crewDoseMsvPerDay).toBe(0.2);
    expect(debrief.radiation.refs).toEqual(fixtureDebrief.radiation.refs);
  });
});
