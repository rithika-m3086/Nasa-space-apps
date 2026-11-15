import React from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { HeartPulse, Leaf, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';
import StatusFace, { getStatus } from './StatusFace.jsx';

const gaugeDetails = {
  power: { label: 'Power', color: 'var(--color-power)', Icon: Zap },
  life: { label: 'Life Support', color: 'var(--color-life)', Icon: HeartPulse },
  shield: { label: 'Shield', color: 'var(--color-shield)', Icon: Shield },
  science: { label: 'Science', color: 'var(--color-science)', Icon: Leaf },
};

export default function GaugeRing({ kind, value = 0 }) {
  const details = gaugeDetails[kind] || gaugeDetails.power;
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const status = getStatus(safeValue);
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(safeValue);
  const [displayValue, setDisplayValue] = useState(Math.round(safeValue));

  useMotionValueEvent(count, 'change', (current) => setDisplayValue(Math.round(current)));

  useEffect(() => {
    const controls = animate(count, safeValue, {
      duration: reducedMotion ? 0 : 0.45,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [count, reducedMotion, safeValue]);

  const { Icon } = details;
  const Ring = kind === 'shield' ? (
    <motion.path
      d="M60 8 103 25v32c0 27-16 46-43 57C33 103 17 84 17 57V25L60 8Z"
      pathLength="100"
      strokeDasharray="100 100"
      initial={false}
      animate={{ strokeDashoffset: 100 - safeValue }}
      transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}
      className="gauge-progress gauge-progress--shield"
    />
  ) : (
    <motion.circle
      cx="60"
      cy="60"
      r="48"
      pathLength="100"
      strokeDasharray="100 100"
      initial={false}
      animate={{ strokeDashoffset: 100 - safeValue }}
      transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}
      className="gauge-progress"
    />
  );

  return (
    <div
      className={`oc-gauge ${status === 'low' && !reducedMotion ? 'oc-gauge__low' : ''}`}
      style={{ '--gauge-color': details.color }}
      role="group"
      aria-label={`${details.label}: ${Math.round(safeValue)} percent, ${status}`}
    >
      <div className="oc-gauge__visual">
        <svg className="oc-gauge__svg" viewBox="0 0 120 120" aria-hidden="true">
          {kind === 'shield' ? (
            <path
              d="M60 8 103 25v32c0 27-16 46-43 57C33 103 17 84 17 57V25L60 8Z"
              pathLength="100"
              className="gauge-track"
            />
          ) : (
            <circle cx="60" cy="60" r="48" pathLength="100" className="gauge-track" />
          )}
          {Ring}
        </svg>
        <Icon className="oc-gauge__icon" aria-hidden="true" />
        <motion.span className="oc-gauge__number">
          {displayValue}
          <span className="text-sm">%</span>
        </motion.span>
      </div>
      <span className="oc-gauge__label">{details.label}</span>
      <StatusFace value={safeValue} />
      <span className="oc-sr-only" aria-live="polite" aria-atomic="true">
        {details.label} is {status}
      </span>
    </div>
  );
}
