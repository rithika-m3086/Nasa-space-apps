import React from 'react';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BigButton, Card } from '../components/ui/index.js';
import RealSunBanner from '../components/RealSunBanner.jsx';
import { normalizeClassCode } from '../store/useMission.js';

export default function Title({ onPlay, onDaily, onClass }) {
  const [classCode, setClassCode] = useState('');
  const normalizedCode = normalizeClassCode(classCode);

  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <Card className="text-center">
        <Sparkles className="mx-auto mb-3 text-[var(--color-science)]" size={40} aria-hidden="true" />
        <p className="font-semibold tracking-wide text-[var(--color-power)]">OUTPOST COMMAND</p>
        <h1 className="oc-display mt-2 text-5xl sm:text-6xl">Junior Flight Director</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
          Lead a kind, clever crew on a seven-day Moon or Mars mission.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <BigButton onClick={onPlay}>Play</BigButton>
          <BigButton variant="secondary" onClick={onDaily}>Daily Mission</BigButton>
        </div>
        <div className="mx-auto mt-6 max-w-sm text-left">
          <label className="grid gap-2 font-semibold" htmlFor="class-code">Class Code</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id="class-code"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
              value={classCode}
              maxLength={40}
              placeholder="Type your class code"
              onChange={(event) => setClassCode(event.target.value)}
            />
            <BigButton variant="secondary" disabled={!normalizedCode} onClick={() => onClass(normalizedCode)}>
              Join
            </BigButton>
          </div>
        </div>
        <p className="mt-6 text-sm text-[var(--color-muted)]">No ads · No sign-up · Stays on your device</p>
      </Card>
      <RealSunBanner />
    </section>
  );
}
