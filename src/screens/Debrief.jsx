import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Sparkles } from 'lucide-react';
import { selectDebrief, selectStickerCatalog, selectDayLabel, useMission } from '../store/useMission.js';
import { BigButton, Card } from '../components/ui/index.js';
import { useReducedMotion } from '../components/ui/useReducedMotion.js';
import MissionChart from './debrief/MissionChart.jsx';
import RadiationMeter from './debrief/RadiationMeter.jsx';

export default function Debrief({ onPlayAgain }) {
  const state = useMission();
  const rewindTo = useMission((mission) => mission.rewindTo);
  const stickers = useMission(selectStickerCatalog);
  const report = selectDebrief(state);
  const reducedMotion = useReducedMotion();
  const dayLabel = selectDayLabel(state.config.site);
  const [showGhost, setShowGhost] = useState(true);
  const [copyMessage, setCopyMessage] = useState('');
  const shareInput = useRef(null);
  const stickerNames = useMemo(
    () => new Map(stickers.map((sticker) => [sticker.id, sticker.name])),
    [stickers],
  );
  const chartData = useMemo(() => {
    const ghostByDay = new Map((report.ghostSeries || []).map((item) => [item.day, item]));
    return (report.humanSeries || []).map((human) => ({
      ...human,
      ghostPower: ghostByDay.get(human.day)?.power,
      ghostLife: ghostByDay.get(human.day)?.life,
      ghostShield: ghostByDay.get(human.day)?.shield,
    }));
  }, [report.ghostSeries, report.humanSeries]);
  const daysToReplay = Math.min(7, Math.max(1, report.days || state.day));
  const bestGauge = ['power', 'life', 'shield']
    .map((key) => ({ key, value: state.gauges[key] }))
    .sort((left, right) => right.value - left.value)[0]?.key;
  const gaugeNames = { power: 'Power', life: 'Life Support', shield: 'Shield' };
  async function copyShareCode() {
    const value = report.shareCode || '';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopyMessage('Share code copied.');
        return;
      }
    } catch {
      // Use the selectable field when clipboard access is blocked.
    }

    shareInput.current?.focus();
    shareInput.current?.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    setCopyMessage(copied ? 'Share code copied.' : 'Share code selected. Copy it now.');
  }

  function openPlaceholder(route) {
    if (typeof window !== 'undefined') window.location.hash = `#/${route}`;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <Card className="text-center">
        <p className="font-semibold text-[var(--color-power)]">MISSION LEARNING REPORT</p>
        {!report.survived && (
          <p className="mt-2 text-lg">Mission paused. Here is what we learned!</p>
        )}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 16 }}
          className="mx-auto mt-3 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 font-bold"
        >
          <Sparkles aria-hidden="true" size={20} />
          {report.rank || 'Mission Explorer'}
        </motion.div>
        <h1 className="oc-display mt-3 text-4xl">Mission Learning Report</h1>
        <p className="mt-2">
          Your crew learned together for {report.days} {dayLabel.toLowerCase()}{report.days === 1 ? '' : 's'}.
        </p>
      </Card>

      <MissionChart
        chartData={chartData}
        dayLabel={dayLabel}
        showGhost={showGhost}
        onToggleGhost={setShowGhost}
      />

      <Card>
        <h2 className="oc-display text-2xl">What we learned</h2>
        <ul className="mt-3 grid gap-2">
          {(report.lessons || []).map((lesson, index) => (
            <li key={`${lesson.day}-${index}`} className="rounded-xl bg-[var(--color-panel-raised)] p-3">
              <strong>{dayLabel} {lesson.day}:</strong> {lesson.text}
            </li>
          ))}
          <li className="rounded-xl bg-[var(--color-panel-raised)] p-3">
            You did great at caring for {gaugeNames[bestGauge] || 'your crew'}!
          </li>
        </ul>
      </Card>

      <RadiationMeter radiation={report.radiation} />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="oc-display text-2xl">Try a day again</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Rewinds left: {state.rewindTokens}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 7 }, (_, index) => index + 1).map((day) => (
            <BigButton
              key={day}
              variant="secondary"
              disabled={state.rewindTokens <= 0 || day > daysToReplay}
              aria-label={`Rewind to ${dayLabel} ${day}`}
              onClick={() => rewindTo(day)}
            >
              {dayLabel} {day}
            </BigButton>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="oc-display text-2xl">Share your mission</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={shareInput}
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-[var(--color-bg)] px-4 font-mono"
            aria-label="Mission share code"
            readOnly
            value={report.shareCode || ''}
          />
          <BigButton variant="secondary" onClick={copyShareCode}>
            {copyMessage === 'Share code copied.' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy
          </BigButton>
        </div>
        <p className="sr-only" aria-live="polite">{copyMessage}</p>
      </Card>

      <Card>
        <h2 className="oc-display text-2xl">Stickers earned</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {(report.stickersEarned || []).map((id, index) => (
            <motion.li
              key={id}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : index * 0.08, type: 'spring' }}
              className="rounded-2xl border border-[var(--color-science)]/40 bg-[var(--color-panel-raised)] px-4 py-3 font-semibold"
            >
              <Sparkles aria-hidden="true" className="mr-2 inline text-[var(--color-science)]" size={18} />
              {stickerNames.get(id) || id.replaceAll('-', ' ')}
            </motion.li>
          ))}
          {!report.stickersEarned?.length && <li className="text-[var(--color-muted)]">Your sticker shelf is ready for next time.</li>}
        </ul>
        <p className="mt-4 rounded-xl bg-[var(--color-panel-raised)] p-3">
          Try Mars on Commander next time!
        </p>
      </Card>

      <nav className="flex flex-wrap justify-center gap-3" aria-label="Mission report actions">
        <BigButton variant="secondary" onClick={() => openPlaceholder('certificate')}>Certificate</BigButton>
        <BigButton variant="secondary" onClick={() => openPlaceholder('patch')}>Patch</BigButton>
        <BigButton variant="secondary" onClick={() => openPlaceholder('stickers')}>Sticker Album</BigButton>
        <BigButton onClick={onPlayAgain}>Play again</BigButton>
        <BigButton variant="ghost" onClick={() => { window.location.hash = '#/teacher'; }}>Teacher kit</BigButton>
      </nav>
    </div>
  );
}
