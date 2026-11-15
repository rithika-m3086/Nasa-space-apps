import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/engine/balance.js';
import { sites } from '../src/data/sites.js';
import { sources } from '../src/data/sources.js';

describe('science data', () => {
  it('uses known source IDs for every real site fact', () => {
    for (const site of Object.values(sites)) {
      for (const fact of site.facts) {
        expect(fact).toMatchObject({ real: true });
        expect(fact.kid).toEqual(expect.any(String));
        expect(
          sources.some((source) => source.id === fact.sourceId) || fact.sourceId === 'TODO-VERIFY',
        ).toBe(true);
      }
    }
  });

  it('flags site sunlight and dust values as game estimates', () => {
    for (const [siteId, site] of Object.entries(sites)) {
      expect(site.gameScaled.gameEstimate).toBe(true);
      expect(site.gameScaled.sun).toEqual(BALANCE.sites[siteId].sunlight);
      expect(site.gameScaled.dust).toEqual(BALANCE.sites[siteId].dust);
      expect(site.gameScaled.sun.every(Number.isFinite)).toBe(true);
      expect(site.gameScaled.dust.every(Number.isFinite)).toBe(true);
    }
  });
});
