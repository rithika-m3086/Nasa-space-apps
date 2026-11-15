import { create } from 'zustand';
import { fixtureDebrief, fixtureStickerCatalog, runningStateFixture } from '../data/fixtures.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function initialStateFromLocation() {
  const state = clone(runningStateFixture);
  if (typeof window === 'undefined') return state;

  const params = new URLSearchParams(window.location.search);
  const site = params.get('site');
  if (site === 'moon' || site === 'mars') state.config.site = site;

  const screen = params.get('s');
  if (screen === 'title') {
    state.status = 'idle';
    state.step = 'allocate';
    state.day = 1;
    state.event = null;
  } else if (screen === 'allocate') {
    state.status = 'running';
    state.step = 'allocate';
  } else if (screen === 'event') {
    state.status = 'running';
    state.step = 'event';
  } else if (screen === 'report') {
    state.status = 'running';
    state.step = 'report';
  } else if (screen === 'ended') {
    state.status = 'ended';
    state.step = 'report';
    state.endReason = 'complete';
    state.rank = 'Flight Director';
  }
  return state;
}

export const selectDayLabel = (site) => (site === 'mars' ? 'Sol' : 'Day');

export function selectAllocationTip(state) {
  const spent = Object.values(state.allocation).reduce((total, value) => total + value, 0);
  const remaining = Math.max(0, state.available - spent);
  return remaining >= 5
    ? `${remaining} energy points remain to share.`
    : 'Your energy is fully planned.';
}

export function selectDebrief(state) {
  return {
    ...clone(fixtureDebrief),
    rank: state.rank || fixtureDebrief.rank,
    survived: state.endReason !== 'life_zero',
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

const initialMissionState = (set, get) => ({
  ...initialStateFromLocation(),
  startMission: (config) => {
    const previous = get().profile;
    const fresh = clone(runningStateFixture);
    const nextConfig = { ...fresh.config, ...config };
    fresh.status = 'running';
    fresh.step = 'allocate';
    fresh.day = 1;
    fresh.config = nextConfig;
    fresh.gauges = { power: 60, life: 80, shield: 75 };
    fresh.science = 0;
    fresh.event = null;
    fresh.lastOutcome = null;
    fresh.dayLog = [];
    fresh.safeModeAvailable = true;
    fresh.rewindTokens = nextConfig.difficulty === 'commander' ? 1 : 2;
    fresh.endReason = null;
    fresh.rank = null;
    fresh.profile = { ...previous, missionsPlayed: previous.missionsPlayed + 1 };
    set(fresh);
  },
  adjustAllocation: (key, delta) => {
    if (!['life', 'shield', 'science'].includes(key) || !Number.isFinite(delta)) return;
    const state = get();
    const otherSpend = Object.entries(state.allocation)
      .filter(([allocationKey]) => allocationKey !== key)
      .reduce((total, [, value]) => total + value, 0);
    const maxForKey = Math.floor(Math.max(0, state.available - otherSpend) / 5) * 5;
    const change = Math.round(delta / 5) * 5;
    const value = Math.min(maxForKey, Math.max(0, state.allocation[key] + change));
    set({ allocation: { ...state.allocation, [key]: value } });
  },
  autoBalance: () => {
    const budget = Math.floor(Math.max(0, get().available) / 5) * 5;
    const life = Math.floor((budget * 0.4) / 5) * 5;
    const shield = Math.floor((budget * 0.4) / 5) * 5;
    set({ allocation: { life, shield, science: budget - life - shield } });
  },
  lockAllocation: () => set({ step: 'event' }),
  chooseOption: (optionId) => {
    const { event } = get();
    const option = event?.options.find((item) => item.id === optionId);
    if (!option) return;
    set({
      step: 'report',
      lastOutcome: {
        optionId: option.id,
        effects: { ...option.effects },
        capcom: option.capcom,
        why: event.why,
      },
    });
  },
  nextDay: () => {
    const state = get();
    if (state.day >= 7) {
      set({ status: 'ended', step: 'report', endReason: 'complete', rank: 'Flight Director' });
      return;
    }
    set({ day: state.day + 1, step: 'allocate' });
  },
  activateSafeMode: () => {
    const { safeModeAvailable, gauges } = get();
    if (!safeModeAvailable) return;
    const cap = (value) => Math.min(100, value);
    set({
      safeModeAvailable: false,
      gauges: {
        power: cap(gauges.power + 20),
        life: cap(gauges.life + 10),
        shield: cap(gauges.shield + 10),
      },
    });
  },
  rewindTo: (day) => {
    const { rewindTokens } = get();
    if (rewindTokens < 1 || !Number.isInteger(day) || day < 1 || day > 7) return;
    set({ day, rewindTokens: rewindTokens - 1, step: 'allocate' });
  },
  resetMission: () => set(initialStateFromLocation()),
  fetchRealSun: () => {
    set({
      live: {
        sun: {
          ...clone(runningStateFixture.live.sun),
          status: 'fallback',
          source: 'snapshot',
        },
      },
    });
  },
});

export const useMission = create((set, get) => initialMissionState(set, get));
