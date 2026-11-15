import { events } from '../data/events.js';
import { runGhost } from './ghost.js';

export const STICKER_CATALOG = Object.freeze([
  {
    id: 'first-flare-survived',
    title: 'First Flare Survived',
    description: 'Your crew made it through a solar flare.',
    unlockCondition: { type: 'survive-event-kind', kind: 'flare' },
    fact: { text: 'NASA DONKI shares reports about solar flares.', sourceId: 'donki' },
  },
  {
    id: 'dust-buster',
    title: 'Dust Buster',
    description: 'Your crew kept going through dusty skies.',
    unlockCondition: { type: 'survive-event-kind', kind: 'dust' },
    fact: { text: 'LCROSS found water ice in the Moon’s Cabeus crater.', sourceId: 'lcross' },
  },
  {
    id: 'shield-master',
    title: 'Shield Master',
    description: 'You ended the mission with a strong shield.',
    unlockCondition: { type: 'complete-gauge', gauge: 'shield', minimum: 80 },
    fact: { text: 'Curiosity carried a Radiation Assessment Detector to Mars.', sourceId: 'rad-surface' },
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Safe Mode helped your crew finish the mission.',
    unlockCondition: { type: 'complete-after-safe-mode' },
    fact: { text: 'Radiation detectors help scientists learn about space travel.', sourceId: 'rad-surface' },
  },
  {
    id: 'ghost-buster',
    title: 'Ghost Buster',
    description: 'Your crew finished with a score at least as strong as the Ghost.',
    unlockCondition: { type: 'complete-beat-ghost' },
    fact: { text: 'Curiosity measured radiation on its trip to Mars.', sourceId: 'rad-surface' },
  },
  {
    id: 'both-worlds',
    title: 'Both Worlds',
    description: 'Your crew has explored the Moon and Mars.',
    unlockCondition: { type: 'complete-both-sites' },
    fact: { text: 'A Shackleton rim spot gets sunlight about 89% of the time.', sourceId: 'mazarico-2011' },
  },
  {
    id: 'rewind-pro',
    title: 'Rewind Pro',
    description: 'You tried a day again and finished your mission.',
    unlockCondition: { type: 'complete-after-rewind' },
    fact: { text: 'NASA shares new space-weather reports as they arrive.', sourceId: 'donki' },
  },
  {
    id: 'daily-explorer',
    title: 'Daily Explorer',
    description: 'You played a Daily Mission today.',
    unlockCondition: { type: 'play-mode', mode: 'daily' },
    fact: { text: 'NASA shares changing space-weather updates.', sourceId: 'donki' },
  },
  {
    id: 'class-pilot',
    title: 'Class Pilot',
    description: 'You joined a mission with your class code.',
    unlockCondition: { type: 'play-mode', mode: 'class' },
    fact: { text: 'Curiosity measured radiation on its trip to Mars.', sourceId: 'rad-surface' },
  },
  {
    id: 'science-star',
    title: 'Science Star',
    description: 'Your crew gathered lots of science.',
    unlockCondition: { type: 'complete-science', minimum: 60 },
    fact: { text: 'LCROSS found water ice in a lunar crater.', sourceId: 'lcross' },
  },
  {
    id: 'moon-mapper',
    title: 'Moon Mapper',
    description: 'Your crew finished a Moon mission.',
    unlockCondition: { type: 'complete-site', site: 'moon' },
    fact: { text: 'One Shackleton rim spot gets sunlight about 89% of the time.', sourceId: 'mazarico-2011' },
  },
  {
    id: 'mars-mapper',
    title: 'Mars Mapper',
    description: 'Your crew finished a Mars mission.',
    unlockCondition: { type: 'complete-site', site: 'mars' },
    fact: { text: 'Curiosity measured radiation on the Mars surface.', sourceId: 'rad-surface' },
  },
  {
    id: 'mission-finisher',
    title: 'Mission Finisher',
    description: 'Your crew completed all seven mission days.',
    unlockCondition: { type: 'complete-mission' },
    fact: { text: 'Curiosity measured radiation on the Mars surface.', sourceId: 'rad-surface' },
  },
  {
    id: 'crew-keeper',
    title: 'Crew Keeper',
    description: 'Your crew finished with strong life support.',
    unlockCondition: { type: 'complete-gauge', gauge: 'life', minimum: 75 },
    fact: { text: 'The ISS has life-support systems for its crew.', sourceId: 'eclss-bvad' },
  },
  {
    id: 'power-keeper',
    title: 'Power Keeper',
    description: 'Your crew saved plenty of power.',
    unlockCondition: { type: 'complete-gauge', gauge: 'power', minimum: 60 },
    fact: { text: 'A Shackleton rim spot gets sunlight about 89% of the time.', sourceId: 'mazarico-2011' },
  },
  {
    id: 'balanced-pilot',
    title: 'Balanced Pilot',
    description: 'Your crew ended with life support and shield ready.',
    unlockCondition: { type: 'complete-balanced', minimum: 50 },
    fact: { text: 'Radiation levels differ between a Mars trip and its surface.', sourceId: 'rad-surface' },
  },
]);

function isComplete(state) {
  return state.status === 'ended' && state.endReason === 'complete';
}

function survivedEventKind(state, kind) {
  return state.dayLog.some((entry) => {
    const event = events.find((item) => item.id === entry.eventId);
    return event?.kind === kind && entry.gauges.life > 0;
  });
}

function beatGhost(state, ghostSeries) {
  const human = state.dayLog[state.dayLog.length - 1];
  const ghost = ghostSeries[ghostSeries.length - 1];
  if (!human || !ghost) return false;
  const humanScore = Math.min(human.gauges.life, human.gauges.shield) + human.science;
  const ghostScore = Math.min(ghost.life, ghost.shield) + ghost.science;
  return humanScore > ghostScore;
}

export function isStickerUnlocked(sticker, state, ghostSeries = []) {
  const condition = sticker.unlockCondition;
  if (condition.type === 'survive-event-kind') return survivedEventKind(state, condition.kind);
  if (condition.type === 'play-mode') return state.config.mode === condition.mode;
  if (condition.type === 'complete-mission') return isComplete(state) && state.dayLog.length >= 7;
  if (condition.type === 'complete-site') return isComplete(state) && state.config.site === condition.site;
  if (condition.type === 'complete-gauge') {
    return isComplete(state) && state.gauges[condition.gauge] >= condition.minimum;
  }
  if (condition.type === 'complete-science') return isComplete(state) && state.science >= condition.minimum;
  if (condition.type === 'complete-after-safe-mode') return isComplete(state) && !state.safeModeAvailable;
  if (condition.type === 'complete-after-rewind') {
    const startingTokens = state.config.difficulty === 'commander' ? 1 : 2;
    return isComplete(state) && state.rewindTokens < startingTokens;
  }
  if (condition.type === 'complete-both-sites') {
    return isComplete(state)
      && state.profile.best.moon > 0
      && state.profile.best.mars > 0;
  }
  if (condition.type === 'complete-beat-ghost') return isComplete(state) && beatGhost(state, ghostSeries);
  if (condition.type === 'complete-balanced') {
    return isComplete(state)
      && Math.min(state.gauges.life, state.gauges.shield) >= condition.minimum;
  }
  return false;
}

export function getNewStickerIds(state, alreadyEarned = []) {
  const ghostSeries = isComplete(state) ? runGhost(state.config, state.dayLog) : [];
  return STICKER_CATALOG
    .filter((sticker) => (
      !alreadyEarned.includes(sticker.id) && isStickerUnlocked(sticker, state, ghostSeries)
    ))
    .map((sticker) => sticker.id);
}
