import { BALANCE } from './balance.js';

function roundDown(value) {
  return Math.floor(value / BALANCE.allocationStep) * BALANCE.allocationStep;
}

export function autoBalance(state) {
  const rules = BALANCE.difficulty[state.config.difficulty];
  const capacity = roundDown(Math.max(0, state.available - BALANCE.reserve));
  let life = roundDown(
    Math.max(0, (BALANCE.targetGauge - state.gauges.life + rules.lifeDrain) / rules.efficiency),
  );
  let shield = roundDown(
    Math.max(0, (BALANCE.targetGauge - state.gauges.shield + BALANCE.sites[state.config.site].shieldDrain)
      / rules.efficiency),
  );

  if (life + shield > capacity) {
    const ratio = capacity / (life + shield);
    life = roundDown(life * ratio);
    shield = roundDown(shield * ratio);
  }

  const remainder = Math.max(0, state.available - life - shield - BALANCE.reserve);
  const science = roundDown(remainder * BALANCE.scienceRemainderFraction);
  return { life, shield, science };
}
