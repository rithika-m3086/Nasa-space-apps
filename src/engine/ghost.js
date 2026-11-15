import { autoBalance } from './autoBalance.js';
import { BALANCE } from './balance.js';
import { activateSafeMode, endDay, lockAllocation, resolveOption } from './step.js';
import { createMission } from './state.js';

function useSafeModeWhenNeeded(state) {
  const weakest = Math.min(...Object.values(state.gauges));
  return state.safeModeAvailable && weakest < BALANCE.safeModeThreshold
    ? activateSafeMode(state)
    : state;
}

export function runGhost(config, dayLog = []) {
  const daysToReplay = dayLog.length
    ? Math.min(BALANCE.days, dayLog.length)
    : BALANCE.days;
  let state = createMission(config);

  while (state.status === 'running' && state.day <= daysToReplay) {
    state = lockAllocation({ ...state, allocation: autoBalance(state) });
    state = useSafeModeWhenNeeded(state);
    if (state.status !== 'running') break;

    const option = state.event.options.find((item) => item.tag === 'balanced')
      || state.event.options.find((item) => item.tag === 'safe');
    if (!option) break;

    state = useSafeModeWhenNeeded(resolveOption(state, option.id));
    if (state.status === 'running') state = endDay(state);
  }

  return state.dayLog.map(({ day, gauges, science }) => ({
    day,
    power: gauges.power,
    life: gauges.life,
    shield: gauges.shield,
    science,
  }));
}
