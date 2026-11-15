import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';

describe('createRng', () => {
  it('creates the same sequence for the same seed', () => {
    const first = createRng('aphelion-2026');
    const second = createRng('aphelion-2026');

    expect(Array.from({ length: 10 }, () => first.next())).toEqual(
      Array.from({ length: 10 }, () => second.next()),
    );
  });
});
