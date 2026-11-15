import { describe, expect, it } from 'vitest';
import {
  activateSafeMode,
  autoBalance,
  createMission,
  endDay,
  lockAllocation,
  resolveOption,
} from '../src/engine/index.js';
import { createRng } from '../src/engine/rng.js';

const SIMULATIONS = 2000;
const SITES = ['moon', 'mars'];
const DIFFICULTIES = ['cadet', 'commander'];

function useSafeModeWhenNeeded(state) {
  const weakest = Math.min(...Object.values(state.gauges));
  return state.safeModeAvailable && weakest < 15 ? activateSafeMode(state) : state;
}

function runMission(site, difficulty, seed, policyName) {
  const config = { site, difficulty, mode: 'free', seed: `${site}-${difficulty}-${seed}` };
  const clicks = createRng(`clicks-${config.seed}`);
  let state = createMission(config);

  while (state.status === 'running') {
    let allocation;
    if (policyName === 'balanced') {
      allocation = autoBalance(state);
    } else if (policyName === 'spend-nothing') {
      allocation = { life: 0, shield: 0, science: 0 };
    } else if (policyName === 'all-science') {
      allocation = { life: 0, shield: 0, science: Math.floor(state.available / 5) * 5 };
    } else {
      allocation = { life: 0, shield: 0, science: 0 };
      const units = Math.floor(state.available / 5);
      for (let click = 0; click < units; click += 1) {
        const key = clicks.pick(['life', 'shield', 'science']);
        allocation[key] += 5;
      }
    }

    state = useSafeModeWhenNeeded(lockAllocation({ ...state, allocation }));
    if (state.status === 'ended') break;
    let option;
    if (policyName === 'random') {
      option = clicks.pick(state.event.options);
    } else if (policyName === 'all-science') {
      option = [...state.event.options].sort((left, right) => right.effects.science - left.effects.science)[0];
    } else if (policyName === 'spend-nothing') {
      option = state.event.options.find((item) => item.tag === 'safe');
    } else {
      option = state.event.options.find((item) => item.tag === 'balanced');
    }
    state = resolveOption(state, option.id);
    state = useSafeModeWhenNeeded(state);
    if (state.status === 'running') state = endDay(state);
  }
  return state;
}

function summarize(site, difficulty, policyName) {
  let survived = 0;
  let finalMinimumTotal = 0;
  let finalLifeTotal = 0;
  let finalShieldTotal = 0;
  for (let seed = 0; seed < SIMULATIONS; seed += 1) {
    const state = runMission(site, difficulty, seed, policyName);
    if (state.endReason === 'complete') survived += 1;
    finalMinimumTotal += Math.min(state.gauges.life, state.gauges.shield);
    finalLifeTotal += state.gauges.life;
    finalShieldTotal += state.gauges.shield;
  }
  return {
    survived,
    survivalRate: survived / SIMULATIONS,
    averageFinalMinimum: finalMinimumTotal / SIMULATIONS,
    averageLife: finalLifeTotal / SIMULATIONS,
    averageShield: finalShieldTotal / SIMULATIONS,
  };
}

describe('balance prototype targets', () => {
  it('keeps same-config day logs deterministic', () => {
    const config = { site: 'mars', difficulty: 'commander', seed: 'repeatable-seed' };
    const play = () => {
      let state = createMission(config);
      while (state.status === 'running') {
        state = useSafeModeWhenNeeded(lockAllocation({ ...state, allocation: autoBalance(state) }));
        if (state.status === 'ended') break;
        state = resolveOption(state, state.event.options[1].id);
        state = useSafeModeWhenNeeded(state);
        if (state.status === 'running') state = endDay(state);
      }
      return state.dayLog;
    };

    expect(play()).toEqual(play());
  });

  it('meets the 2000-seed survival and ending-gauge targets', () => {
    const results = [];
    const balancedResults = [];
    for (const site of SITES) {
      for (const difficulty of DIFFICULTIES) {
        const result = summarize(site, difficulty, 'balanced');
        const row = { site, difficulty, policy: 'balanced', ...result };
        results.push(row);
        balancedResults.push(row);
      }
    }

    for (const site of SITES) {
      for (const difficulty of DIFFICULTIES) {
        const result = summarize(site, difficulty, 'spend-nothing');
        results.push({ site, difficulty, policy: 'spend-nothing', ...result });
      }
      const randomResult = summarize(site, 'cadet', 'random');
      results.push({ site, difficulty: 'cadet', policy: 'random', ...randomResult });

      const scienceResult = summarize(site, 'commander', 'all-science');
      results.push({ site, difficulty: 'commander', policy: 'all-science', ...scienceResult });
    }
    console.log(JSON.stringify(results));
    for (const result of balancedResults) {
      expect(result.survivalRate).toBeGreaterThanOrEqual(0.95);
    }
    for (const result of balancedResults) {
      const endingMinimum = Math.round(result.averageFinalMinimum);
      if (result.difficulty === 'cadet') {
        expect(endingMinimum).toBeGreaterThanOrEqual(46);
        expect(endingMinimum).toBeLessThanOrEqual(49);
      } else {
        expect(endingMinimum).toBeGreaterThanOrEqual(27);
        expect(endingMinimum).toBeLessThanOrEqual(38);
      }
    }
    for (const result of results) {
      if (result.policy === 'spend-nothing') expect(result.survivalRate).toBeLessThan(0.05);
      if (result.policy === 'random') expect(result.survivalRate).toBeGreaterThan(0.95);
      if (result.policy === 'all-science') expect(result.survivalRate).toBeLessThan(0.2);
    }
  }, 120_000);
});
