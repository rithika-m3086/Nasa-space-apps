import { create } from 'zustand';
import { fixtureDebrief, fixtureStickerCatalog } from '../data/fixtures.js';
import {
  BALANCE,
  activateSafeMode,
  autoBalance as getBalancedAllocation,
  createMission,
  endDay,
  lockAllocation as runAllocation,
  normalizeClassCode,
  resolveOption,
  rewindMission,
  selectAllocationTip as getAllocationTip,
} from '../engine/index.js';

function initialStateFromLocation() {
  const config = {
    cadetName: 'Nova',
    avatar: 'astronaut',
    site: 'moon',
    difficulty: 'cadet',
    mode: 'free',
    seed: 'fixture-moon-cadet',
  };
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const site = params.get('site');
    if (site === 'moon' || site === 'mars') config.site = site;
  }
  let state = createMission(config);

  if (typeof window !== 'undefined') {
    const screen = new URLSearchParams(window.location.search).get('s');
    if (screen === 'title') state = { ...state, status: 'idle' };
    if (screen === 'event' || screen === 'report') {
      state = runAllocation(state);
      if (screen === 'report' && state.event) {
        state = resolveOption(state, state.event.options[0].id);
      }
    }
    if (screen === 'ended') {
      state = { ...state, status: 'ended', step: 'report', endReason: 'complete', rank: 'Cadet' };
    }
  }
  return state;
}

export const selectDayLabel = (site) => (site === 'mars' ? 'Sol' : 'Day');

export function selectAllocationTip(state) {
  return getAllocationTip(state);
}

export function selectDebrief(state) {
  const humanSeries = Array.from({ length: BALANCE.days }, (_, index) => {
    const day = index + 1;
    const log = state.dayLog.find((entry) => entry.day === day);
    return log
      ? { day, ...log.gauges, science: log.science }
      : fixtureDebrief.humanSeries[index];
  });
  return {
    ...fixtureDebrief,
    rank: state.rank || fixtureDebrief.rank,
    survived: state.endReason !== 'life_zero',
    days: state.dayLog.length || state.day,
    humanSeries,
    shareCode: selectShareCode(state),
    stickersEarned: [...state.profile.stickers],
  };
}

export function selectStickerCatalog(state) {
  return fixtureStickerCatalog.map((sticker) => ({
    ...sticker,
    unlocked: state.profile.stickers.includes(sticker.id),
  }));
}

export const selectShouldSuggestBreak = (state) => state.profile.sessionMissions >= 3;

export function selectShareCode(state) {
  const siteCode = state.config.site === 'mars' ? 'R' : 'M';
  const seedCode = String(state.config.seed || 'MISSION')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(-6);
  return `AP-${siteCode}-${seedCode}`;
}

export const useMission = create((set, get) => ({
  ...initialStateFromLocation(),
  startMission: (config) => {
    const previous = get().profile;
    const mission = createMission(config);
    mission.profile = {
      ...previous,
      missionsPlayed: previous.missionsPlayed + 1,
      sessionMissions: previous.sessionMissions + 1,
    };
    set(mission);
  },
  adjustAllocation: (key, delta) => {
    if (!['life', 'shield', 'science'].includes(key) || !Number.isFinite(delta)) return;
    const state = get();
    const otherSpend = Object.entries(state.allocation)
      .filter(([allocationKey]) => allocationKey !== key)
      .reduce((total, [, value]) => total + value, 0);
    const maxForKey = Math.floor(Math.max(0, state.available - otherSpend) / BALANCE.allocationStep)
      * BALANCE.allocationStep;
    const change = Math.round(delta / BALANCE.allocationStep) * BALANCE.allocationStep;
    const value = Math.min(maxForKey, Math.max(0, state.allocation[key] + change));
    set({ allocation: { ...state.allocation, [key]: value } });
  },
  autoBalance: () => set({ allocation: getBalancedAllocation(get()) }),
  lockAllocation: () => set(runAllocation(get())),
  chooseOption: (optionId) => set(resolveOption(get(), optionId)),
  nextDay: () => set(endDay(get())),
  activateSafeMode: () => set(activateSafeMode(get())),
  rewindTo: (day) => set(rewindMission(get(), day)),
  resetMission: () => {
    const { config, profile } = get();
    set({ ...createMission(config), profile });
  },
  fetchRealSun: () => {
    set((state) => ({
      live: {
        sun: {
          ...state.live.sun,
          status: 'fallback',
          source: 'snapshot',
        },
      },
    }));
  },
}));

export { normalizeClassCode };
