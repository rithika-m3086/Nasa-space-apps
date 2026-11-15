import React from 'react';
import { BatteryCharging, HeartPulse, Shield } from 'lucide-react';
import { useMission, selectDayLabel } from '../store/useMission.js';
import { Card, useReducedMotion } from '../components/ui/index.js';
import OutpostViewport from '../components/OutpostViewport.jsx';
import SettingsSheet from '../components/SettingsSheet.jsx';
import Allocate from './Allocate.jsx';
import EventCard from './EventCard.jsx';
import Report from './Report.jsx';

const gaugeDetails = [
  { key: 'power', label: 'Power', Icon: BatteryCharging, color: 'var(--color-power)' },
  { key: 'life', label: 'Life Support', Icon: HeartPulse, color: 'var(--color-life)' },
  { key: 'shield', label: 'Shield', Icon: Shield, color: 'var(--color-shield)' },
];

export default function Play({ guidedStep = null, onReplayTutorial }) {
  const state = useMission();
  const reducedMotion = useReducedMotion();
  const dayLabel = selectDayLabel(state.config.site);
  const guided = state.step === 'allocate'
    && state.day === 1
    && Number.isInteger(guidedStep)
    && guidedStep >= 0
    && guidedStep <= 2;
  const focusedKey = guided ? ['power', 'life', 'shield'][guidedStep] : null;
  const visibleGauges = focusedKey
    ? gaugeDetails.filter((gauge) => gauge.key === focusedKey)
    : gaugeDetails;

  return (
    <section className="oc-play mx-auto grid max-w-5xl gap-4">
      <div className="oc-play__settings">
        <SettingsSheet onReplayTutorial={onReplayTutorial} />
      </div>
      <header className="oc-play__header">
        <p className="font-semibold text-[var(--color-power)]">MISSION</p>
        <h1 className="oc-display text-4xl">{dayLabel} {state.day}</h1>
      </header>
      <div className="oc-play__gauges" aria-label="Crew gauges">
        {visibleGauges.map(({ key, label, Icon, color }) => (
          <div
            className={`oc-play__gauge${key === focusedKey && key === 'power' ? ` tutorial-spotlight${reducedMotion ? ' tutorial-spotlight--still' : ''}` : ''}`}
            data-tutorial-target={key === 'power' && key === focusedKey ? 'power' : undefined}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.gauges[key])}
            aria-label={`${label}: ${Math.round(state.gauges[key])} percent`}
            style={{ '--gauge-color': color }}
            key={key}
          >
            <div className="oc-play__gauge-title">
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
            </div>
            <strong>{Math.round(state.gauges[key])}%</strong>
            <div className="oc-play__meter-track" aria-hidden="true">
              <span style={{ width: `${state.gauges[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Card className="p-2 sm:p-4"><OutpostViewport /></Card>
      {state.step === 'allocate' && <Allocate compact guidedStep={guidedStep} />}
      {state.step === 'event' && <EventCard />}
      {state.step === 'report' && <Report />}
    </section>
  );
}
