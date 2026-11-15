import { describe, expect, it } from 'vitest';
import nasaImages from '../src/data/nasa-images.json';
import { events } from '../src/data/events.js';
import { sources } from '../src/data/sources.js';
import { autoBalance, createMission, endDay, lockAllocation, resolveOption } from '../src/engine/index.js';

const knownSource = (id) => id === 'TODO-VERIFY' || sources.some((source) => source.id === id);
const tags = ['safe', 'balanced', 'risky'];

describe('mission events', () => {
  it('matches the event schema and uses known source and image IDs', () => {
    const nasaIds = new Set(nasaImages.items.map((image) => image.nasa_id));
    expect(events).toHaveLength(18);

    for (const event of events) {
      expect(event).toMatchObject({
        id: expect.any(String),
        sites: expect.any(Array),
        kind: expect.stringMatching(/^(flare|dust|micrometeorite|equipment|crew|discovery|comms)$/),
        title: expect.any(String),
        kid: expect.any(String),
        why: expect.any(String),
        science: {
          headline: expect.any(String),
          mission: expect.any(String),
          instrument: expect.any(String),
          fact: expect.any(String),
          sourceId: expect.any(String),
        },
      });
      expect(knownSource(event.science.sourceId)).toBe(true);
      expect(event.options).toHaveLength(3);
      expect(event.options.map((option) => option.tag)).toEqual(tags);
      for (const option of event.options) {
        expect(option).toMatchObject({
          id: expect.any(String),
          label: expect.any(String),
          hint: expect.any(String),
          effects: {
            power: expect.any(Number),
            life: expect.any(Number),
            shield: expect.any(Number),
            science: expect.any(Number),
          },
          shieldScaled: expect.any(Boolean),
          capcom: expect.any(String),
        });
      }
      if (event.kind === 'flare') expect(event.donkiSlot).toBe(true);
      if (event.image) expect(nasaIds.has(event.image.nasaId)).toBe(true);
    }
  });

  it('has the requested site coverage and repeated kinds', () => {
    expect(events.filter((event) => event.sites.length === 1 && event.sites[0] === 'moon')).toHaveLength(8);
    expect(events.filter((event) => event.sites.length === 1 && event.sites[0] === 'mars')).toHaveLength(8);
    expect(events.filter((event) => event.sites.length === 2)).toHaveLength(2);
    const minimums = {
      moon: { flare: 2, equipment: 2, discovery: 2, crew: 2 },
      mars: { dust: 2, discovery: 2, crew: 2 },
    };

    for (const [site, kinds] of Object.entries(minimums)) {
      for (const [kind, minimum] of Object.entries(kinds)) {
        expect(events.filter((event) => event.sites.includes(site) && event.kind === kind).length)
          .toBeGreaterThanOrEqual(minimum);
      }
    }
  });

  it('keeps kid text short and uses simple words', () => {
    const allowLongWords = new Set(['astronauts', 'radiation']);
    for (const event of events) {
      const sentences = event.kid.split(/[.!?]+/).map((text) => text.trim()).filter(Boolean);
      const wordLists = sentences.map((sentence) => sentence.match(/[A-Za-z0-9']+/g) || []);
      const average = wordLists.flat().length / Math.max(1, wordLists.length);
      expect(average).toBeLessThanOrEqual(12);
      for (const word of wordLists.flat()) {
        const letters = word.toLowerCase().replace(/[^a-z]/g, '');
        expect(letters.length <= 12 || allowLongWords.has(letters)).toBe(true);
      }
    }
  });

  it('shows at least five distinct events in six runs on each site', () => {
    for (const site of ['moon', 'mars']) {
      for (let run = 0; run < 6; run += 1) {
        let state = createMission({ site, seed: `event-run-${run}`, difficulty: 'cadet' });
        const eventIds = [];
        while (state.status === 'running') {
          state = lockAllocation({ ...state, allocation: autoBalance(state) });
          if (state.status !== 'running') break;
          eventIds.push(state.event.id);
          state = resolveOption(
            state,
            state.event.options.find((option) => option.tag === 'balanced').id,
          );
          if (state.status === 'running') state = endDay(state);
        }
        expect(new Set(eventIds).size).toBeGreaterThanOrEqual(5);
      }
    }
  });
});
