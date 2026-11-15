import React, { useEffect } from 'react';
import { MousePointer2, Shield, Trophy } from 'lucide-react';
import Bolt from '../components/Bolt.jsx';
import { BigButton, Card } from '../components/ui/index.js';
import { usePrefs } from './usePrefs.js';
import { cancel, speak } from '../voice/speak.js';

const steps = [
  { text: 'Tap a choice to keep the crew safe.', Icon: MousePointer2, expression: 'thinking' },
  { text: 'Use the shield when the Sun sends a flare.', Icon: Shield, expression: 'worried' },
  { text: 'Finish all 7 days to win!', Icon: Trophy, expression: 'cheering' },
];

export default function HowToPlay({ onContinue }) {
  const lang = usePrefs((preferences) => preferences.lang);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      speak(steps.map((step) => step.text).join(' '), { lang, rate: 0.9 });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      cancel();
    };
  }, [lang]);

  return (
    <section className="mx-auto grid max-w-5xl gap-5">
      <Card className="text-center">
        <h1 className="oc-display text-4xl">How to play</h1>
        <p className="mt-2 text-[var(--color-muted)]">Bolt will help you along the way.</p>
      </Card>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map(({ text, Icon, expression }, index) => (
          <Card className="min-w-0 text-center" key={text}>
            <div className="relative mx-auto grid h-16 w-16 place-items-center">
              <Bolt expression={expression} size={52} />
              <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-panel-raised)] text-[var(--color-power)]">
                <Icon aria-hidden="true" size={18} />
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed sm:text-base">{text}</p>
            <span className="oc-sr-only">Step {index + 1} of 3.</span>
          </Card>
        ))}
      </div>
      <div className="flex gap-3">
        <BigButton className="flex-1" onClick={onContinue}>Let&apos;s go!</BigButton>
        <BigButton className="flex-1" variant="secondary" onClick={onContinue}>Skip</BigButton>
      </div>
    </section>
  );
}
