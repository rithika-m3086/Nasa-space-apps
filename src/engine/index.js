export { createRng, hashSeed, mulberry32 } from './rng.js';

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
