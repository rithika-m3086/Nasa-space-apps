import React from 'react';
import { motion } from 'framer-motion';
import { useMission, selectDayLabel } from '../store/useMission.js';
import { ArrowDownRight, ArrowUpRight, RotateCcw } from 'lucide-react';
import { BigButton, CapcomBubble, Card } from '../components/ui/index.js';
import { selectDiaryEntry } from './diary.js';
import { useReducedMotion } from '../components/ui/useReducedMotion.js';

const gaugeLabels = { power: 'Power', life: 'Life Support', shield: 'Shield', science: 'Science' };

export default function Report() {
  const state = useMission();
  const nextDay = useMission((mission) => mission.nextDay);
  const rewindTo = useMission((mission) => mission.rewindTo);
  const reducedMotion = useReducedMotion();
  const outcome = state.lastOutcome;
  const diary = selectDiaryEntry(state.crew, state.day);
  const label = selectDayLabel(state.config.site);
  const effects = outcome?.effects || {};

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Card>
        <p className="font-semibold text-[var(--color-power)]">{label} {state.day} · MISSION LOG</p>
        <h1 className="oc-display mt-1 text-4xl">Your crew learned together</h1>
        <CapcomBubble message={outcome?.capcom || 'Your crew is learning and ready for the next step.'} />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Mission effects">
          {Object.entries(effects).filter(([, value]) => value !== 0).map(([key, value], index) => {
            const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
            return (
              <motion.div
                key={key}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : index * 0.08 }}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-panel-raised)] p-3"
              >
                <Icon aria-hidden="true" className={value > 0 ? 'text-[var(--color-science)]' : 'text-[var(--color-life)]'} />
                <span className="font-semibold">{gaugeLabels[key]} {value > 0 ? '+' : ''}{Math.round(value)}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="oc-display mb-3 text-2xl">Crew check-in</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {state.crew.map((member) => (
            <li key={member.id} className="rounded-xl border border-white/10 p-3">
              <span className="font-semibold">{member.name}</span>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {member.mood === 'worried' ? 'Needs a little care.' : member.mood === 'happy' ? 'Feels ready to help.' : 'Taking things one step at a time.'}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="oc-display text-2xl">Crew Mission Log</h2>
        <p className="mt-2"><strong>{diary.name} wrote:</strong> “{diary.text}”</p>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        {state.rewindTokens > 0 && (
          <BigButton variant="secondary" onClick={() => rewindTo(state.day)}>
            <RotateCcw aria-hidden="true" size={20} /> Rewind to this day
          </BigButton>
        )}
        <BigButton onClick={nextDay}>Next day</BigButton>
      </div>
    </div>
  );
}
