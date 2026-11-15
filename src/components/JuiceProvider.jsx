import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useMission } from '../store/useMission.js';
import { sfx, configureSfx } from '../audio/sfx.js';
import { usePrefs } from '../screens/usePrefs.js';
import './JuiceProvider.css';

const gaugeNames = { power: 'Power', life: 'Life', shield: 'Shield', science: 'Science' };
const floatPositions = { power: '18%', life: '40%', shield: '62%', science: '82%' };

function isMotionReduced(setting) {
  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return typeof window !== 'undefined'
    && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function celebrate(reduced) {
  if (reduced) return;
  confetti({
    disableForReducedMotion: true,
    particleCount: 34,
    spread: 56,
    startVelocity: 28,
    origin: { y: 0.72 },
  });
}

export default function JuiceProvider({ children }) {
  const [shaking, setShaking] = useState(false);
  const [floaties, setFloaties] = useState([]);
  const sequence = useRef(0);
  const shakeTimer = useRef(null);

  useEffect(() => {
    configureSfx(usePrefs.getState());
    const unsubscribe = usePrefs.subscribe((preferences) => configureSfx(preferences));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const update = (state, previous) => {
      const preferences = usePrefs.getState();
      const reduced = isMotionReduced(preferences.reducedMotion);
      Object.keys(state.gauges).forEach((key) => {
        const change = state.gauges[key] - previous.gauges[key];
        if (change === 0) return;
        sfx.gaugeChange(change > 0 ? 'up' : 'down');
        if (key === 'shield') sfx.shieldHum(change > 0 ? 'up' : 'down');
        if (previous.gauges[key] >= 25 && state.gauges[key] < 25) sfx.softAlert();
      });

      if (state.step === 'event' && previous.step !== 'event') {
        sfx.lockInWhoosh();
        if (state.event?.kind === 'flare') sfx.flareRumble();
      }

      if (state.lastOutcome && state.lastOutcome !== previous.lastOutcome) {
        const option = state.event?.options.find((item) => item.id === state.lastOutcome.optionId);
        if (state.status === 'running') {
          sfx.successChime();
          celebrate(reduced);
        }
        if (option?.tag === 'risky' && !reduced) {
          setShaking(true);
          window.clearTimeout(shakeTimer.current);
          shakeTimer.current = window.setTimeout(() => setShaking(false), 260);
        }
        if (!reduced) {
          const nextFloaties = Object.entries(state.lastOutcome.effects)
            .filter(([, value]) => value !== 0)
            .map(([key, value]) => ({
              id: ++sequence.current,
              key,
              value,
            }));
          setFloaties(nextFloaties);
        }
      }

      if (state.status === 'ended' && previous.status !== 'ended' && state.endReason === 'complete') {
        sfx.fanfare();
        celebrate(reduced);
      }
    };

    const unsubscribe = useMission.subscribe(update);
    return () => {
      unsubscribe();
      window.clearTimeout(shakeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!floaties.length) return undefined;
    const timer = window.setTimeout(() => setFloaties([]), 1250);
    return () => window.clearTimeout(timer);
  }, [floaties]);

  const onClickCapture = (event) => {
    if (event.target.closest('input[type="range"]')) return;
    sfx.tap();
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(15);
      } catch {
        return;
      }
    }
  };
  const onInputCapture = (event) => {
    if (event.target.matches('input[type="range"]')) sfx.sliderTick();
  };

  return (
    <div className={`juice-provider${shaking ? ' juice-provider--shake' : ''}`} onClickCapture={onClickCapture} onInputCapture={onInputCapture}>
      {children}
      <div className="juice-float-layer" aria-hidden="true">
        {floaties.map((item) => (
          <motion.span
            key={item.id}
            className={`juice-float juice-float--${item.key}`}
            style={{ left: floatPositions[item.key] }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -38, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {item.value > 0 ? '+' : ''}{Math.round(item.value)} {gaugeNames[item.key]}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
