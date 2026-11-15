import React from 'react';
import { useMission, selectDebrief, selectDayLabel } from '../store/useMission.js';
import { BigButton, Card } from '../components/ui/index.js';

export default function Ended({ onPlayAgain }) {
  const state = useMission();
  const report = selectDebrief(state);
  const rank = state.rank || 'Not ranked yet';
  const dayWord = selectDayLabel(state.config.site).toLowerCase();
  return (
    <Card className="mx-auto grid max-w-2xl justify-items-center gap-4 text-center">
      <p className="font-semibold text-[var(--color-power)]">
        {state.endReason === 'life_zero' ? 'MISSION LEARNING REPORT' : 'MISSION COMPLETE'}
      </p>
      <h1 className="oc-display text-4xl">Mission Learning Report</h1>
      <p className="text-lg">Your crew finished {report.days} {dayWord}{report.days === 1 ? '' : 's'} together.</p>
      <p className="rounded-full bg-[var(--color-panel-raised)] px-5 py-3 font-semibold">
        Mission rank: {rank}
      </p>
      {state.endReason === 'life_zero' && (
        <p className="text-[var(--color-muted)]">Every mission teaches us something for next time.</p>
      )}
      <BigButton onClick={onPlayAgain}>Play again</BigButton>
    </Card>
  );
}
