import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { BigButton, CapcomBubble, Card, useReducedMotion } from '../components/ui/index.js';
import { speak } from '../voice/speak.js';
import { usePrefs } from './usePrefs.js';

const lessons = [
  {
    target: 'power',
    title: 'Power',
    message: 'Power is stored energy. It helps your outpost run.',
  },
  {
    target: 'life',
    title: 'Life Support',
    message: 'Choose energy for Life Support. Your crew needs it each day.',
  },
  {
    target: 'shield',
    title: 'Shield',
    message: 'Choose energy for Shields. Your shield helps the crew stay ready.',
  },
];

export default function FirstMission({ step, onStepChange, onFinish }) {
  const reducedMotion = useReducedMotion();
  const lang = usePrefs((state) => state.lang);
  const welcome = step < 0;
  const lesson = welcome ? null : lessons[step] || lessons[0];
  const target = welcome ? 'power' : lesson.target;
  const message = welcome
    ? 'Bolt will show you three helpful tools for your first day.'
    : lesson.message;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const targetElement = document.querySelector(`[data-tutorial-target="${target}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({
          block: 'start',
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
        const control = targetElement.querySelector('input:not(:disabled), button:not(:disabled)');
        (control || targetElement).focus({ preventScroll: true });
        return;
      }
      document.querySelector('.oc-first-mission [data-tutorial-primary]')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion, step, target]);

  const next = () => {
    if (welcome) onStepChange(0);
    else if (step === lessons.length - 1) onFinish();
    else onStepChange(step + 1);
  };

  return (
    <Card
      as="section"
      className="oc-first-mission"
      aria-labelledby="first-mission-title"
    >
      <p className="font-semibold text-[var(--color-power)]">
        {welcome ? 'FIRST MISSION' : `DAY 1 GUIDE · ${step + 1} OF ${lessons.length}`}
      </p>
      <h2 id="first-mission-title" className="oc-display mt-1 text-2xl">
        {welcome ? 'Ready for Day 1?' : lesson.title}
      </h2>
      <CapcomBubble message={message} />
      <BigButton
        variant="secondary"
        className="mt-3 w-full"
        onClick={() => speak(message, { lang })}
      >
        <Volume2 aria-hidden="true" size={20} />
        Show me
      </BigButton>
      <div className="oc-first-mission__actions mt-3">
        <BigButton
          className="w-full"
          data-tutorial-primary
          onClick={next}
        >
          {welcome ? 'Start' : step === lessons.length - 1 ? 'Done' : 'Next'}
        </BigButton>
        <BigButton variant="secondary" className="w-full" onClick={onFinish}>
          Skip
        </BigButton>
      </div>
    </Card>
  );
}
