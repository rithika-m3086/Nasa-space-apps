import React from 'react';
import { BigButton, Card } from '../components/ui/index.js';
import './planet-map.css';

export default function PlanetMap({ onSelectSite, onBack }) {
  return (
    <Card className="oc-planet-map">
      <div className="oc-planet-map__intro">
        <p className="font-semibold tracking-wide text-[var(--color-power)]">STAR MAP</p>
        <h1 className="oc-display mt-1 text-4xl">Pick a planet</h1>
        <p className="mt-2 text-[var(--color-muted)]">Where should your crew land?</p>
      </div>
      <svg className="oc-planet-map__orbits" viewBox="0 0 640 340" aria-hidden="true">
        <path d="M50 190c100-170 438-170 540 0" />
        <path d="M52 190c100 172 436 172 536 0" />
        <circle cx="94" cy="70" r="2" />
        <circle cx="188" cy="36" r="3" />
        <circle cx="450" cy="44" r="2" />
        <circle cx="555" cy="94" r="3" />
        <circle cx="320" cy="24" r="2" />
        <circle cx="320" cy="316" r="2" />
      </svg>
      <div className="oc-planet-map__choices">
        <BigButton
          variant="secondary"
          className="oc-planet-map__button"
          aria-label="Choose Moon landing site"
          onClick={() => onSelectSite('moon')}
        >
          <span className="oc-planet-map__orb oc-planet-map__orb--moon" aria-hidden="true">
            <span />
          </span>
          <span className="oc-display text-2xl">Moon</span>
        </BigButton>
        <BigButton
          variant="secondary"
          className="oc-planet-map__button"
          aria-label="Choose Mars landing site"
          onClick={() => onSelectSite('mars')}
        >
          <span className="oc-planet-map__orb oc-planet-map__orb--mars" aria-hidden="true">
            <span />
          </span>
          <span className="oc-display text-2xl">Mars</span>
        </BigButton>
      </div>
      <div className="oc-planet-map__back">
        <BigButton variant="ghost" onClick={onBack}>Back</BigButton>
      </div>
    </Card>
  );
}
