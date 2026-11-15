import React from 'react';
import { Play } from 'lucide-react';
import Bolt from '../components/Bolt.jsx';
import { BigButton, Card } from '../components/ui/index.js';

export default function Title({ onPlay, onHowToPlay }) {
  return (
    <Card className="mx-auto grid max-w-2xl justify-items-center gap-5 py-10 text-center">
      <Bolt expression="happy" size={104} />
      <h1 className="oc-display text-4xl sm:text-6xl">Keep the crew safe!</h1>
      <div className="title-actions">
        <BigButton variant="secondary" className="title-how-button" onClick={onHowToPlay}>
          How to play
        </BigButton>
        <BigButton className="title-start-button" onClick={onPlay}>
          <Play aria-hidden="true" focusable="false" size={20} fill="currentColor" />
          <span>Start</span>
        </BigButton>
      </div>
      <a
        className="inline-flex min-h-12 items-center px-3 text-sm text-[var(--color-power)] underline"
        href="#/learn"
      >
        Learn more
      </a>
    </Card>
  );
}
