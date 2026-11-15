import { describe, expect, it } from 'vitest';
import { sources } from '../src/data/sources.js';
import { fixtureStickerCatalog } from '../src/data/fixtures.js';
import { stickerFacts } from '../src/screens/classroomData.js';
import { parseShareCode } from '../src/screens/shareCode.js';

describe('parseShareCode', () => {
  it('reads Moon and Mars codes without changing their mission key', () => {
    expect(parseShareCode('AP-M-7DAYS')).toEqual({ site: 'Moon', missionKey: '7DAYS' });
    expect(parseShareCode('AP-R-ORBIT')).toEqual({ site: 'Mars', missionKey: 'ORBIT' });
  });

  it('accepts surrounding whitespace and lowercase input', () => {
    expect(parseShareCode(' ap-m-abc123 ')).toEqual({ site: 'Moon', missionKey: 'ABC123' });
  });

  it('rejects malformed or oversized codes', () => {
    expect(parseShareCode('AP-X-7DAYS')).toBeNull();
    expect(parseShareCode('AP-M-TOOLONG')).toBeNull();
    expect(parseShareCode('')).toBeNull();
  });

  it('provides a sourced fact for every catalog sticker', () => {
    expect(Object.keys(stickerFacts)).toHaveLength(16);
    for (const sticker of fixtureStickerCatalog) {
      const sourceId = stickerFacts[sticker.id]?.sourceId;
      const source = sources.find((item) => item.id === sourceId);
      expect(source?.url).toMatch(/^https:\/\//);
    }
  });
});
