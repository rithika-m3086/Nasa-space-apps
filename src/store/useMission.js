import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { fetchRealSun as getLiveSun } from '../data/liveSun.js';
import {
  BALANCE,
  activateSafeMode,
  autoBalance as getBalancedAllocation,
  createMission,
  endDay,
  getDailySeed,
  lockAllocation as runAllocation,
  normalizeClassCode,
  resolveOption,
  rewindMission,
} from '../engine/index.js';
import { updateProfileAndStickers } from './missionSelectors.js';

const NO_REWINDS_TIP = 'No rewinds left. You can still learn from this run.';
const noBrowserStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function getMissionStorage() {
  try {
    return typeof window === 'undefined' ? noBrowserStorage : window.localStorage;
  } catch {
    return noBrowserStorage;
  }
}

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

export const useMission = create(persist((set, get) => ({
  ...initialStateFromLocation(),
  startMission: (config) => {
    const previous = get().profile;
    const missionConfig = { ...config };
    if (missionConfig.mode === 'daily') missionConfig.seed = getDailySeed();
    if (missionConfig.mode === 'class') missionConfig.seed = normalizeClassCode(missionConfig.seed);
    const mission = createMission(missionConfig);
    mission.profile = {
      ...previous,
      missionsPlayed: previous.missionsPlayed + 1,
      sessionMissions: previous.sessionMissions + 1,
    };
    set(updateProfileAndStickers(mission));
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
  lockAllocation: () => set(updateProfileAndStickers(runAllocation(get()))),
  chooseOption: (optionId) => set(updateProfileAndStickers(resolveOption(get(), optionId))),
  nextDay: () => set(updateProfileAndStickers(endDay(get()))),
  activateSafeMode: () => set(activateSafeMode(get())),
  rewindTo: (day) => {
    const state = get();
    if (state.rewindTokens <= 0) {
      const lastOutcome = state.lastOutcome || {
        optionId: null,
        effects: { power: 0, life: 0, shield: 0, science: 0 },
        why: NO_REWINDS_TIP,
      };
      set({ lastOutcome: { ...lastOutcome, capcom: NO_REWINDS_TIP } });
      return;
    }
    const rewound = rewindMission(state, day);
    if (rewound !== state) set(updateProfileAndStickers(rewound));
  },
  resetMission: () => {
    const { config, profile } = get();
    set({ ...createMission(config), profile });
  },
  fetchRealSun: async () => {
    set((state) => ({
      live: { sun: { ...state.live.sun, status: 'loading' } },
    }));
    const sun = await getLiveSun();
    set({ live: { sun } });
  },
}), {
  name: 'aphelion.v1',
  storage: createJSONStorage(getMissionStorage),
  partialize: (state) => ({ profile: state.profile }),
}));

export { normalizeClassCode };
export {
  parseShareCode,
  selectAllocationTip,
  selectDayLabel,
  selectDebrief,
  selectShareCode,
  selectShouldSuggestBreak,
  selectStickerCatalog,
} from './missionSelectors.js';
