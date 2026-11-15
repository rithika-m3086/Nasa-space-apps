import { describe, expect, it } from 'vitest';
import { events } from '../src/data/events.js';
import { sources } from '../src/data/sources.js';
import { createMission, isStickerUnlocked, runGhost, STICKER_CATALOG } from '../src/engine/index.js';

function makeCompletedState(site = 'moon') {
  const config = { site, difficulty: 'cadet', mode: 'free', seed: `sticker-${site}` };
  const initial = createMission(config);
  const ghost = runGhost(config);
  const dayLog = ghost.map((item, index) => ({
    day: item.day,
    gauges: { power: item.power, life: item.life, shield: item.shield },
    science: item.science,
    eventId: events.find((event) => event.sites.includes(site)).id,
    optionId: `option-${index}`,
    allocation: { life: 0, shield: 0, science: 0 },
  }));
  return {
    ...initial,
    status: 'ended',
    step: 'report',
    day: 7,
    gauges: { power: 65, life: 80, shield: 85 },
    science: 70,
    dayLog,
    safeModeAvailable: true,
    rewindTokens: 1,
    endReason: 'complete',
    rank: 'Pilot',
    profile: { ...initial.profile, best: { moon: 7, mars: 7 } },
  };
}

function withEvent(state, kind) {
  const event = events.find((item) => item.kind === kind && item.sites.includes(state.config.site));
  return {
    ...state,
    dayLog: [{
      ...state.dayLog[0],
      eventId: event.id,
      gauges: { ...state.dayLog[0].gauges, life: 20 },
    }, ...state.dayLog.slice(1)],
  };
}

describe('mission sticker catalog and unlock rules', () => {
  it('has 16 sourced stickers with short kid-friendly descriptions', () => {
    expect(STICKER_CATALOG).toHaveLength(16);
    for (const sticker of STICKER_CATALOG) {
      expect(sticker.id).toBeTruthy();
      expect(sticker.title).toBeTruthy();
      expect(sticker.description.split(/[.!?]+/).filter(Boolean).every(
        (sentence) => sentence.trim().split(/\s+/).length <= 14,
      )).toBe(true);
      expect(
        sticker.fact.sourceId === 'TODO-VERIFY'
        || sources.some((source) => source.id === sticker.fact.sourceId),
      ).toBe(true);
    }
  });

  it.each([
    ['first-flare-survived', (state) => withEvent(state, 'flare')],
    ['dust-buster', (state) => withEvent(state, 'dust')],
    ['shield-master', (state) => state],
    ['comeback-kid', (state) => ({ ...state, safeModeAvailable: false })],
    ['ghost-buster', (state) => ({
      ...state,
      dayLog: [
        ...state.dayLog.slice(0, -1),
        {
          ...state.dayLog[state.dayLog.length - 1],
          gauges: { ...state.dayLog[state.dayLog.length - 1].gauges, life: 100, shield: 100 },
          science: 100,
        },
      ],
    })],
    ['both-worlds', (state) => state],
    ['rewind-pro', (state) => ({ ...state, rewindTokens: 1 })],
    ['daily-explorer', (state) => ({ ...state, status: 'running', endReason: null, config: { ...state.config, mode: 'daily' } })],
    ['class-pilot', (state) => ({ ...state, status: 'running', endReason: null, config: { ...state.config, mode: 'class' } })],
    ['science-star', (state) => state],
    ['moon-mapper', (state) => ({ ...state, config: { ...state.config, site: 'moon' } })],
    ['mars-mapper', (state) => ({ ...state, config: { ...state.config, site: 'mars' } })],
    ['mission-finisher', (state) => state],
    ['crew-keeper', (state) => state],
    ['power-keeper', (state) => state],
    ['balanced-pilot', (state) => state],
  ])('unlocks %s when its rule is met', (stickerId, prepareState) => {
    const state = prepareState(makeCompletedState());
    const sticker = STICKER_CATALOG.find((item) => item.id === stickerId);
    const ghost = stickerId === 'ghost-buster' ? runGhost(state.config, state.dayLog) : [];
    expect(isStickerUnlocked(sticker, state, ghost)).toBe(true);
  });

  it('does not unlock completion stickers before a mission is complete', () => {
    const state = { ...makeCompletedState(), status: 'running', endReason: null };
    const sticker = STICKER_CATALOG.find((item) => item.id === 'mission-finisher');
    expect(isStickerUnlocked(sticker, state)).toBe(false);
  });
});
