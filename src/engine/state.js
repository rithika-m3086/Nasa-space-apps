import { fixtureLiveSun } from '../data/fixtures.js';
import { BALANCE } from './balance.js';
import { createCrew } from './crew.js';

const HISTORY = Symbol('missionHistory');

export function getDailySeed() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeClassCode(text) {
  return String(text ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .slice(0, 20);
}

export function getDayConditions(site, day) {
  const siteRules = BALANCE.sites[site];
  const index = Math.min(BALANCE.days - 1, Math.max(0, day - BALANCE.firstDay));
  const sunlight = siteRules.sunlight[index];
  const dust = siteRules.dust[index];
  const energyToday = Math.round(
    siteRules.generation * sunlight * (1 - BALANCE.dustGenerationFactor * dust),
  );
  return { sunlight, dust, energyToday };
}

export function snapshotDayStart(state) {
  const history = state[HISTORY] || [];
  history.push(JSON.parse(JSON.stringify(state)));
  return { ...state, [HISTORY]: history };
}

export function getMissionHistory(state) {
  return (state[HISTORY] || []).map((snapshot) => JSON.parse(JSON.stringify(snapshot)));
}

export function attachMissionHistory(state, historySource) {
  const history = Array.isArray(historySource) ? historySource : historySource[HISTORY] || [];
  return { ...state, [HISTORY]: history };
}

export function createMission(inputConfig = {}) {
  const config = {
    cadetName: 'Cadet',
    avatar: 'astronaut',
    site: 'moon',
    difficulty: 'cadet',
    mode: 'free',
    seed: getDailySeed(),
    ...inputConfig,
  };
  if (!BALANCE.sites[config.site]) config.site = 'moon';
  if (!BALANCE.difficulty[config.difficulty]) config.difficulty = 'cadet';
  const rules = BALANCE.difficulty[config.difficulty];
  const conditions = getDayConditions(config.site, BALANCE.firstDay);
  const state = {
    status: 'running',
    step: 'allocate',
    config,
    day: BALANCE.firstDay,
    gauges: { ...BALANCE.initialGauges },
    science: 0,
    ...conditions,
    available: BALANCE.initialGauges.power + conditions.energyToday,
    allocation: { life: 0, shield: 0, science: 0 },
    event: null,
    lastOutcome: null,
    crew: [],
    dayLog: [],
    safeModeAvailable: true,
    rewindTokens: rules.rewinds,
    endReason: null,
    rank: null,
    live: { sun: { ...fixtureLiveSun } },
    profile: {
      stickers: [],
      missionsPlayed: 0,
      sessionMissions: 0,
      sessionStartedAt: new Date().toISOString(),
      best: { moon: 0, mars: 0 },
    },
    [HISTORY]: [],
  };
  state.crew = createCrew(config.seed, state.gauges);
  return snapshotDayStart(state);
}
