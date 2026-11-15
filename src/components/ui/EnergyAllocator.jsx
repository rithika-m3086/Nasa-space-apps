import React from 'react';
import { HeartPulse, Leaf, Shield } from 'lucide-react';
import { useMission } from '../../store/useMission.js';
import { useReducedMotion } from './useReducedMotion.js';

const rows = [
  { key: 'life', label: 'Life Support', Icon: HeartPulse },
  { key: 'shield', label: 'Shield', Icon: Shield },
  { key: 'science', label: 'Science', Icon: Leaf },
];

export default function EnergyAllocator({ focusedKey = null }) {
  const allocation = useMission((state) => state.allocation);
  const available = useMission((state) => state.available);
  const adjustAllocation = useMission((state) => state.adjustAllocation);
  const reducedMotion = useReducedMotion();
  const spent = Object.values(allocation).reduce((sum, amount) => sum + amount, 0);
  const energyLeft = Math.max(0, available - spent);
  const visibleRows = focusedKey ? rows.filter((row) => row.key === focusedKey) : rows;

  return (
    <section className="oc-allocator" aria-label="Energy allocation">
      {visibleRows.map(({ key, label, Icon }) => {
        const value = allocation[key];
        const otherSpent = spent - value;
        const max = Math.floor(Math.max(0, available - otherSpent) / 5) * 5;
        return (
          <div
            className={`oc-allocator__row${focusedKey === key ? ` tutorial-spotlight${reducedMotion ? ' tutorial-spotlight--still' : ''}` : ''}`}
            data-tutorial-target={focusedKey === key ? key : undefined}
            tabIndex={focusedKey === key ? -1 : undefined}
            key={key}
          >
            <label className="oc-allocator__label" htmlFor={`allocation-${key}`}>
              <Icon aria-hidden="true" size={20} />
              <span>{label}</span>
            </label>
            <button
              type="button"
              className="oc-allocator__step"
              aria-label={`Remove 5 energy from ${label}`}
              disabled={value <= 0}
              onClick={() => adjustAllocation(key, -5)}
            >
              −5
            </button>
            <output className="oc-allocator__value" htmlFor={`allocation-${key}`}>
              {value}
            </output>
            <button
              type="button"
              className="oc-allocator__step"
              aria-label={`Add 5 energy to ${label}`}
              disabled={value >= max}
              onClick={() => adjustAllocation(key, 5)}
            >
              +5
            </button>
            <input
              id={`allocation-${key}`}
              className="oc-allocator__slider"
              type="range"
              min="0"
              max={max}
              step="5"
              value={Math.min(value, max)}
              aria-valuetext={`${value} energy`}
              onChange={(event) => adjustAllocation(key, Number(event.target.value) - value)}
            />
          </div>
        );
      })}
      <p className="font-semibold text-[var(--color-muted)]" aria-live="polite">
        Energy left: <span className="text-[var(--color-text)]">{energyLeft}</span>
      </p>
    </section>
  );
}
