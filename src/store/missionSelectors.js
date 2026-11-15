import { events } from '../data/events.js';
import { fixtureDebrief } from '../data/fixtures.js';
import { radiationReality } from '../data/radiationReality.js';
import {
  BALANCE,
  getNewStickerIds,
  runGhost,
  selectAllocationTip as getAllocationTip,
  STICKER_CATALOG,
} from '../engine/index.js';

const LESSON_GAUGES = ['power', 'life', 'shield'];

function getOptionTag(eventId, optionId) {
  return events.find((event) => event.id === eventId)
    ?.options.find((option) => option.id === optionId)?.tag;
}

function getLessons(dayLog, ghostSeries, site) {
  const humanByDay = new Map(dayLog.map((entry) => [entry.day, entry]));
  const ghostByDay = new Map(ghostSeries.map((entry) => [entry.day, entry]));
  const dayLabel = site === 'mars' ? 'Sol' : 'Day';
  const lessons = [];

  for (const entry of dayLog) {
    const event = events.find((item) => item.id === entry.eventId);
    const humanTag = getOptionTag(entry.eventId, entry.optionId);
    const ghostTag = event?.options.find((option) => option.tag === 'balanced')?.tag
      || event?.options.find((option) => option.tag === 'safe')?.tag;
    const humanNext = humanByDay.get(entry.day + 1);
    const ghostNext = ghostByDay.get(entry.day + 1);
    if (!humanTag || !ghostTag || humanTag === ghostTag || !humanNext || !ghostNext) continue;

    const largestDifference = LESSON_GAUGES
      .map((gauge) => ({
        gauge,
        humanValue: humanNext.gauges[gauge],
        ghostValue: ghostNext[gauge],
        difference: Math.abs(humanNext.gauges[gauge] - ghostNext[gauge]),
      }))
      .sort((left, right) => right.difference - left.difference)[0];
    if (largestDifference.difference <= 10) continue;

    const subject = { power: 'power', life: 'life support', shield: 'the shield' }[largestDifference.gauge];
    const suggestion = {
      power: 'Saving power earlier may have helped.',
      life: 'More life support may have helped.',
      shield: 'Raising it earlier may have helped.',
    }[largestDifference.gauge];
    const comparison = largestDifference.humanValue < largestDifference.ghostValue
      ? `${subject} was lower than the Ghost. ${suggestion}`
      : `${subject} was higher than the Ghost. Nice work, crew!`;
    lessons.push({ day: entry.day + 1, text: `On ${dayLabel} ${entry.day + 1} ${comparison}` });
    if (lessons.length === 3) break;
  }

  lessons.push({
    day: dayLog[0]?.day || 1,
    text: 'Your crew kept learning one choice at a time.',
  });
  return lessons;
}

export const selectDayLabel = (site) => (site === 'mars' ? 'Sol' : 'Day');

export function selectAllocationTip(state) {
  return getAllocationTip(state);
}

export function selectDebrief(state) {
  const humanSeries = state.dayLog.map((entry) => ({
    day: entry.day,
    ...entry.gauges,
    science: entry.science,
  }));
  if (!humanSeries.length) {
    humanSeries.push({ day: state.day, ...state.gauges, science: state.science });
  }
  const ghostSeries = runGhost(state.config, state.dayLog);
  const shieldAverage = state.dayLog.length
    ? state.dayLog.reduce((total, entry) => total + entry.gauges.shield, 0) / state.dayLog.length
    : state.gauges.shield;
  const surfaceDose = radiationReality.refs.find((ref) => ref.id === 'mars-surface')?.msvPerDay || 0;
  return {
    ...fixtureDebrief,
    rank: state.rank,
    survived: state.endReason !== 'life_zero',
    days: state.dayLog.length || state.day,
    humanSeries,
    ghostSeries,
    lessons: getLessons(state.dayLog, ghostSeries, state.config.site),
    radiation: {
      crewDoseMsvPerDay: Number((surfaceDose * (1 - shieldAverage / 100)).toFixed(2)),
      refs: radiationReality.refs,
    },
    shareCode: selectShareCode(state),
    stickersEarned: [...state.profile.stickers],
  };
}

export function selectStickerCatalog(state) {
  return STICKER_CATALOG.map((sticker) => ({
    id: sticker.id,
    name: sticker.title,
    title: sticker.title,
    description: sticker.description,
    unlockCondition: sticker.unlockCondition,
    fact: sticker.fact,
    unlocked: state.profile.stickers.includes(sticker.id),
  }));
}

export function selectShouldSuggestBreak(state, now = Date.now()) {
  const startedAt = Date.parse(state.profile.sessionStartedAt);
  const elapsed = Number.isFinite(startedAt) && now >= startedAt
    ? now - startedAt
    : 0;
  return state.profile.sessionMissions >= 3 || elapsed >= 25 * 60 * 1000;
}

export function updateProfileAndStickers(state) {
  let profile = state.profile;
  if (state.status === 'ended' && state.endReason === 'complete') {
    profile = {
      ...profile,
      best: {
        ...profile.best,
        [state.config.site]: Math.max(profile.best[state.config.site] || 0, state.dayLog.length),
      },
    };
  }
  const additions = getNewStickerIds({ ...state, profile }, profile.stickers);
  if (!additions.length && profile === state.profile) return state;
  return {
    ...state,
    profile: { ...profile, stickers: [...profile.stickers, ...additions] },
  };
}

export function selectShareCode(state) {
  const cadetName = String(state.config.cadetName || 'CADET')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16) || 'CADET';
  const days = Math.min(BALANCE.days, state.dayLog.length || state.day);
  const shieldAverage = state.dayLog.length
    ? state.dayLog.reduce((total, entry) => total + entry.gauges.shield, 0) / state.dayLog.length
    : state.gauges.shield;
  const rank = String(state.rank || 'LEARNING').toUpperCase().replace(/\s+/g, '-');
  return [
    cadetName,
    state.config.site.toUpperCase(),
    state.config.difficulty.toUpperCase(),
    `D${days}`,
    `S${Math.round(shieldAverage)}`,
    `SCI${Math.round(state.science)}`,
    rank,
  ].join('|');
}

export function parseShareCode(code) {
  const parts = String(code ?? '').trim().split('|');
  if (parts.length !== 7) return null;
  const [cadetName, site, difficulty, dayToken, shieldToken, scienceToken, rawRank] = parts;
  const day = /^D([1-7])$/.exec(dayToken);
  const shield = /^S(\d{1,3})$/.exec(shieldToken);
  const science = /^SCI(\d+)$/.exec(scienceToken);
  if (
    !cadetName
    || !['MOON', 'MARS'].includes(site)
    || !['CADET', 'COMMANDER'].includes(difficulty)
    || !day
    || !shield
    || Number(shield[1]) > 100
    || !science
    || !rawRank
  ) return null;
  return {
    cadetName,
    site: site.toLowerCase(),
    difficulty: difficulty.toLowerCase(),
    days: Number(day[1]),
    shield: Number(shield[1]),
    science: Number(science[1]),
    rank: rawRank.split('-').map((word) => `${word[0]}${word.slice(1).toLowerCase()}`).join(' '),
  };
}
