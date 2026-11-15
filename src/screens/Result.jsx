import React from 'react';
import { useMission, selectDebrief, selectDayLabel } from '../store/useMission.js';
import { BigButton, Card } from '../components/ui/index.js';

export default function Result({ onPlayAgain, onNextMission, onNavigate }) {
  const state = useMission();
  const report = selectDebrief(state);
  const dayWord = selectDayLabel(state.config.site).toLowerCase();
  const won = state.endReason === 'complete';
  const options = [
    { label: 'Play again', action: onPlayAgain, variant: 'primary' },
    { label: 'Sticker album', action: () => onNavigate('#/album') },
    { label: 'Teacher kit', action: () => onNavigate('#/teacher') },
    { label: 'Learn more', action: () => onNavigate('#/learn') },
    { label: 'Why this is safe', action: () => onNavigate('#/safe') },
  ];

  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <Card className="grid justify-items-center gap-4 text-center">
        <p className="font-semibold text-[var(--color-power)]">
          {won ? 'MISSION COMPLETE' : 'MISSION LEARNING REPORT'}
        </p>
        <h1 className="oc-display text-4xl">Mission Learning Report</h1>
        <p className="text-lg">
          Your crew finished {report.days} {dayWord}{report.days === 1 ? '' : 's'} together.
        </p>
        {won ? (
          <p className="rounded-full bg-[var(--color-panel-raised)] px-5 py-3 font-semibold">
            Mission rank: {state.rank || report.rank}
          </p>
        ) : (
          <p className="text-[var(--color-muted)]">
            Every mission teaches us something for next time.
          </p>
        )}
      </Card>
      {won && (
        <BigButton className="min-h-16 w-full text-xl" onClick={onNextMission}>
          Next mission
        </BigButton>
      )}
      <Card>
        <h2 className="oc-display mb-3 text-2xl">What would you like to do?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map(({ label, action, variant = 'secondary' }) => (
            <BigButton className="w-full" key={label} variant={variant} onClick={action}>
              {label}
            </BigButton>
          ))}
        </div>
      </Card>
    </section>
  );
}
