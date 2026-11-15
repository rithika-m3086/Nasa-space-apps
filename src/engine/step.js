import { events } from '../data/events.js';
import { BALANCE } from './balance.js';
import { updateCrewMood } from './crew.js';
import { createRng } from './rng.js';
import { attachMissionHistory, getDayConditions, getMissionHistory, snapshotDayStart } from './state.js';

function clampGauge(value) {
  return Math.min(BALANCE.gaugeMaximum, Math.max(BALANCE.gaugeMinimum, value));
}

function clampAllocation(allocation, available) {
  const normalized = {
    life: Math.max(0, Math.floor(allocation.life / BALANCE.allocationStep) * BALANCE.allocationStep),
    shield: Math.max(0, Math.floor(allocation.shield / BALANCE.allocationStep) * BALANCE.allocationStep),
    science: Math.max(0, Math.floor(allocation.science / BALANCE.allocationStep) * BALANCE.allocationStep),
  };
  const total = normalized.life + normalized.shield + normalized.science;
  if (total <= available || total === 0) return normalized;
  const ratio = available / total;
  return {
    life: Math.floor((normalized.life * ratio) / BALANCE.allocationStep) * BALANCE.allocationStep,
    shield: Math.floor((normalized.shield * ratio) / BALANCE.allocationStep) * BALANCE.allocationStep,
    science: Math.floor((normalized.science * ratio) / BALANCE.allocationStep) * BALANCE.allocationStep,
  };
}

export function applyAllocation(state) {
  const allocation = clampAllocation(state.allocation, state.available);
  const rules = BALANCE.difficulty[state.config.difficulty];
  let life = state.gauges.life - rules.lifeDrain
    + rules.efficiency * allocation.life
    + BALANCE.scienceLifeSupport * allocation.science;
  const shield = clampGauge(
    state.gauges.shield - BALANCE.sites[state.config.site].shieldDrain
      + rules.efficiency * allocation.shield,
  );
  if (shield === 0) life -= BALANCE.zeroShieldLifePenalty;
  else if (shield < BALANCE.lowShieldThreshold) life -= BALANCE.lowShieldLifePenalty;
  const power = clampGauge(state.available - allocation.life - allocation.shield - allocation.science);
  const gauges = { power, life: clampGauge(life), shield };
  return {
    ...state,
    allocation,
    gauges,
    available: power + state.energyToday,
    science: state.science + allocation.science,
    crew: updateCrewMood(state.crew, gauges),
  };
}

function getEventForDay(config, day) {
  const rng = createRng(`${config.seed}|${config.site}|${config.difficulty}`);
  const siteEvents = events.filter((event) => event.sites.includes(config.site));
  const shuffled = rng.shuffle(siteEvents);
  return shuffled[(day - 1) % shuffled.length];
}

function appendDayLog(state, optionId = null) {
  const alreadyLogged = state.dayLog.some((entry) => entry.day === state.day);
  if (alreadyLogged) return state;
  const entry = {
    day: state.day,
    gauges: { ...state.gauges },
    science: state.science,
    eventId: state.event?.id || null,
    optionId,
    allocation: { ...state.allocation },
  };
  return { ...state, dayLog: [...state.dayLog, entry] };
}

function finishForLifeZero(state) {
  return {
    ...appendDayLog(state),
    status: 'ended',
    step: 'report',
    endReason: 'life_zero',
    rank: null,
  };
}

export function lockAllocation(state) {
  if (state.status !== 'running' || state.step !== 'allocate') return state;
  const allocated = applyAllocation(state);
  const event = getEventForDay(state.config, state.day);
  const next = { ...allocated, event, step: 'event' };
  return next.gauges.life <= 0 ? finishForLifeZero(next) : next;
}

function getRank(state) {
  const minimumGauge = Math.min(state.gauges.life, state.gauges.shield);
  const threshold = BALANCE.rankThresholds.find(
    (item) => minimumGauge >= item.minimumGauge && state.science >= item.science,
  );
  return threshold?.rank || 'Cadet';
}

export function resolveOption(state, optionId) {
  if (state.status !== 'running' || state.step !== 'event' || state.lastOutcome || !state.event) return state;
  const option = state.event.options.find((item) => item.id === optionId);
  if (!option) return state;

  const rules = BALANCE.difficulty[state.config.difficulty];
  const shieldFactor = option.shieldScaled
    ? 1 - BALANCE.shieldLifeHarmFactor * state.gauges.shield / BALANCE.gaugeMaximum
    : 1;
  const lifeEffect = option.effects.life * rules.eventScale
    * (option.effects.life < 0 ? shieldFactor : 1);
  const before = state.gauges;
  const gauges = {
    power: clampGauge(before.power + option.effects.power * rules.eventScale),
    life: clampGauge(before.life + lifeEffect),
    shield: clampGauge(before.shield + option.effects.shield * rules.eventScale),
  };
  const next = {
    ...state,
    gauges,
    available: gauges.power + state.energyToday,
    science: Math.max(0, state.science + option.effects.science * rules.eventScale),
    crew: updateCrewMood(state.crew, gauges),
    lastOutcome: {
      optionId: option.id,
      effects: {
        power: gauges.power - before.power,
        life: gauges.life - before.life,
        shield: gauges.shield - before.shield,
        science: option.effects.science * rules.eventScale,
      },
      capcom: option.capcom,
      why: state.event.why,
    },
    step: 'report',
  };
  const logged = appendDayLog(next, option.id);
  return gauges.life <= 0
    ? { ...logged, status: 'ended', endReason: 'life_zero', rank: null }
    : logged;
}

export function endDay(state) {
  if (state.status !== 'running') return state;
  const logged = appendDayLog(state, state.lastOutcome?.optionId || null);
  if (logged.gauges.life <= 0) return finishForLifeZero(logged);
  if (logged.day >= BALANCE.days) {
    return {
      ...logged,
      status: 'ended',
      step: 'report',
      endReason: 'complete',
      rank: getRank(logged),
    };
  }

  const day = logged.day + 1;
  const conditions = getDayConditions(logged.config.site, day);
  const next = {
    ...logged,
    step: 'allocate',
    day,
    ...conditions,
    available: logged.gauges.power + conditions.energyToday,
    allocation: { life: 0, shield: 0, science: 0 },
    event: null,
    lastOutcome: null,
  };
  return snapshotDayStart(next);
}

export function activateSafeMode(state) {
  if (!state.safeModeAvailable) return state;
  const weakest = Math.min(...Object.values(state.gauges));
  if (weakest >= BALANCE.safeModeThreshold) return state;
  const gauges = {
    power: clampGauge(state.gauges.power + BALANCE.safeModeBoost.power),
    life: clampGauge(state.gauges.life + BALANCE.safeModeBoost.life),
    shield: clampGauge(state.gauges.shield + BALANCE.safeModeBoost.shield),
  };
  const dayLog = state.dayLog.some((entry) => entry.day === state.day)
    ? state.dayLog.map((entry) => (entry.day === state.day
      ? { ...entry, gauges: { ...gauges }, science: state.science }
      : entry))
    : state.dayLog;
  return {
    ...state,
    safeModeAvailable: false,
    gauges,
    dayLog,
    available: gauges.power + state.energyToday,
    crew: updateCrewMood(state.crew, gauges),
  };
}

export function rewindMission(state, day) {
  if (
    state.rewindTokens <= 0
    || !Number.isInteger(day)
    || day < BALANCE.firstDay
    || day > state.day
  ) return state;
  const snapshot = getMissionHistory(state).find((entry) => entry.day === day);
  if (!snapshot) return state;
  const history = getMissionHistory(state).filter((entry) => entry.day < day);
  history.push(snapshot);
  const rewound = {
    ...snapshot,
    profile: state.profile,
    rewindTokens: state.rewindTokens - 1,
  };
  return attachMissionHistory(rewound, history);
}
