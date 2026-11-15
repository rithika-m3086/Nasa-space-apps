import React from 'react';
import { useMission, selectAllocationTip, selectDayLabel } from '../store/useMission.js';
import { BatteryCharging } from 'lucide-react';
import {
  BigButton,
  CapcomBubble,
  Card,
  DayRail,
  EnergyAllocator,
  GaugeRing,
} from '../components/ui/index.js';
import OutpostViewport from '../components/OutpostViewport.jsx';

export default function Allocate() {
  const state = useMission();
  const autoBalance = useMission((mission) => mission.autoBalance);
  const lockAllocation = useMission((mission) => mission.lockAllocation);
  const activateSafeMode = useMission((mission) => mission.activateSafeMode);
  const dayLabel = selectDayLabel(state.config.site);
  const gaugesLow = Math.min(state.gauges.power, state.gauges.life, state.gauges.shield) < 15;

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--color-power)]">MISSION CONTROL</p>
          <h1 className="oc-display text-4xl">{dayLabel} {state.day}</h1>
          <p className="text-[var(--color-muted)]">{state.config.site === 'moon' ? 'Moon outpost' : 'Mars outpost'}</p>
        </div>
        <DayRail day={state.day} site={state.config.site} />
      </header>

      <Card><OutpostViewport /></Card>

      <Card data-tutorial-target="gauges">
        <h2 className="oc-display mb-4 text-2xl">Crew check</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <GaugeRing kind="power" value={state.gauges.power} />
          <GaugeRing kind="life" value={state.gauges.life} />
          <GaugeRing kind="shield" value={state.gauges.shield} />
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-[var(--color-panel-raised)] p-3" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.gauges.power)} aria-label={`Power battery ${Math.round(state.gauges.power)} percent`}>
          <div className="flex items-center gap-2">
            <BatteryCharging aria-hidden="true" className="text-[var(--color-power)]" />
            <span className="font-semibold">Power battery · {Math.round(state.gauges.power)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/30">
            <div className="h-full rounded-full bg-[var(--color-power)]" style={{ width: `${state.gauges.power}%` }} />
          </div>
        </div>
      </Card>

      <Card data-tutorial-target="allocator">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="oc-display text-2xl">Plan today’s energy</h2>
          <BigButton variant="secondary" onClick={autoBalance}>Auto-balance</BigButton>
        </div>
        <p className="my-3 text-[var(--color-muted)]">{selectAllocationTip(state)}</p>
        <EnergyAllocator />
      </Card>

      <Card>
        <h2 className="oc-display mb-3 text-2xl">CAPCOM tip</h2>
        <CapcomBubble message={selectAllocationTip(state)} />
      </Card>

      <div className="flex flex-wrap justify-center gap-3" data-tutorial-target="lock">
        {state.safeModeAvailable && gaugesLow && (
          <BigButton variant="secondary" onClick={activateSafeMode}>
            Low-Power Safe Mode
          </BigButton>
        )}
        <BigButton onClick={lockAllocation}>Lock in</BigButton>
      </div>
    </div>
  );
}
