import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { BigButton, Card } from '../components/ui/index.js';
import { useReducedMotion } from '../components/ui/useReducedMotion.js';

const steps = [
  { target: 'gauges', title: 'Check the gauges', text: 'Power, life support, and shields help your crew stay ready.' },
  { target: 'allocator', title: 'Share your energy', text: 'Use the sliders to plan energy for your crew and science.' },
  { target: 'lock', title: 'Lock in your plan', text: 'When your plan feels ready, lock it in and see what happens.' },
];

export default function Briefing({ onDone }) {
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const panelRef = useRef(null);

  useEffect(() => {
    const target = document.querySelector(`[data-tutorial-target="${steps[step].target}"]`);
    const previousFocus = document.activeElement;
    target?.classList.add('tutorial-spotlight');
    target?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
    const focusables = () => [...(panelRef.current?.querySelectorAll('button:not(:disabled)') || [])];
    focusables()[0]?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onDone();
      if (event.key === 'Tab') {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      target?.classList.remove('tutorial-spotlight');
      document.removeEventListener('keydown', closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [onDone, reducedMotion, step]);

  return (
    <div className="tutorial-backdrop" role="presentation">
      <div ref={panelRef} className="tutorial-panel" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
        <Card>
          <p className="text-sm font-bold text-[var(--color-power)]">QUICK BRIEFING · {step + 1} OF 3</p>
          <h2 id="briefing-title" className="oc-display mt-1 text-3xl">{steps[step].title}</h2>
          <p className="my-3 text-[var(--color-muted)]">{steps[step].text}</p>
          <div className="flex flex-wrap gap-3">
            <BigButton onClick={() => (step === steps.length - 1 ? onDone() : setStep((current) => current + 1))}>
              {step === steps.length - 1 ? 'Let us go' : 'Next'}
            </BigButton>
            <BigButton variant="ghost" onClick={onDone}>Skip briefing</BigButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
