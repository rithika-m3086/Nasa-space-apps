import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Home, Sparkles, Star, Sun } from 'lucide-react';
import { sfx } from '../audio/sfx.js';
import copy from '../i18n/en.json';
import { useReducedMotion } from './ui/useReducedMotion.js';
import '../styles/flare-wave.css';

const WAVE_DURATION = 20_000;
const FLARE_COUNT = 8;
const SPAWN_INTERVAL = 2_400;
const LANES = [16, 38, 62, 84];
const SPEEDS = {
  c: { className: 'slow', duration: 3_000 },
  m: { className: 'medium', duration: 2_000 },
  x: { className: 'fast', duration: 1_100 },
};

function getSpeed(flareClass) {
  const letter = String(flareClass || 'M').trim().toLowerCase()[0];
  return SPEEDS[letter] || SPEEDS.m;
}

function getStars(taps) {
  const ratio = taps / FLARE_COUNT;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  return taps > 0 ? 1 : 0;
}

export default function FlareWave({ flareClass, onComplete }) {
  const reducedMotion = useReducedMotion();
  const speedRef = useRef(getSpeed(flareClass));
  const [flares, setFlares] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [missed, setMissed] = useState(false);
  const [stars, setStars] = useState(null);
  const tapsRef = useRef(0);
  const finishedRef = useRef(false);
  const resolvedRef = useRef(new Set());
  const flareTimersRef = useRef(new Map());
  const burstTimersRef = useRef(new Map());
  const burstIdRef = useRef(0);

  useEffect(() => {
    speedRef.current = getSpeed(flareClass);
  }, [flareClass]);

  const resolveFlare = useCallback((flare, wasTapped) => {
    if (finishedRef.current || resolvedRef.current.has(flare.id)) return;
    resolvedRef.current.add(flare.id);
    const timer = flareTimersRef.current.get(flare.id);
    if (timer) window.clearTimeout(timer);
    flareTimersRef.current.delete(flare.id);
    setFlares((current) => current.filter((item) => item.id !== flare.id));

    if (!wasTapped) {
      setMissed(true);
      return;
    }

    tapsRef.current += 1;
    setTapCount(tapsRef.current);
    setMissed(false);
    const burstId = ++burstIdRef.current;
    setBursts((current) => [...current, { id: burstId, lane: flare.lane }]);
    const burstTimer = window.setTimeout(() => {
      setBursts((current) => current.filter((item) => item.id !== burstId));
      burstTimersRef.current.delete(burstId);
    }, 500);
    burstTimersRef.current.set(burstId, burstTimer);
  }, []);

  useEffect(() => {
    finishedRef.current = false;
    resolvedRef.current = new Set();
    tapsRef.current = 0;
    setFlares([]);
    setBursts([]);
    setProgress(0);
    setTapCount(0);
    setMissed(false);
    setStars(null);

    const startedAt = Date.now();
    let spawned = 0;
    let spawnTimer;

    const spawnFlare = () => {
      if (spawned >= FLARE_COUNT) return;
      const flare = {
        id: spawned + 1,
        lane: LANES[spawned % LANES.length],
        duration: speedRef.current.duration,
        speed: speedRef.current.className,
      };
      spawned += 1;
      setFlares((current) => [...current, flare]);
      const timer = window.setTimeout(() => resolveFlare(flare, false), flare.duration);
      flareTimersRef.current.set(flare.id, timer);
    };

    spawnFlare();
    spawnTimer = window.setInterval(() => {
      if (spawned >= FLARE_COUNT) {
        window.clearInterval(spawnTimer);
        return;
      }
      spawnFlare();
    }, SPAWN_INTERVAL);
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(100, (elapsed / WAVE_DURATION) * 100));
      if (elapsed < WAVE_DURATION) return;

      window.clearInterval(spawnTimer);
      window.clearInterval(progressTimer);
      finishedRef.current = true;
      setProgress(100);
      setFlares([]);
      flareTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      flareTimersRef.current.clear();
      const result = getStars(tapsRef.current);
      setStars(result);
      if (result === 3) sfx.successChime();
      onComplete(result);
    }, 100);

    return () => {
      window.clearInterval(spawnTimer);
      window.clearInterval(progressTimer);
      flareTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      burstTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      flareTimersRef.current.clear();
      burstTimersRef.current.clear();
    };
  }, [onComplete, resolveFlare]);

  const handleStageKeyDown = (event) => {
    if (event.target !== event.currentTarget || ![' ', 'Enter'].includes(event.key)) return;
    const nextFlare = flares[0];
    if (!nextFlare) return;
    event.preventDefault();
    sfx.tap();
    resolveFlare(nextFlare, true);
  };

  const resultLine = stars === null ? '' : copy.flareWave.results[stars];
  const tapAnnouncement = tapCount === 1
    ? copy.flareWave.oneFlareTapped
    : copy.flareWave.tappedCount.replace('{count}', String(tapCount));
  const reducedClass = reducedMotion ? ' flare-wave--reduced' : '';

  return (
    <section className={`flare-wave${reducedClass}`} aria-label={copy.flareWave.title}>
      <header className="flare-wave__header">
        <h2 className="oc-display text-2xl">{copy.flareWave.title}</h2>
        <p>{copy.flareWave.instruction}</p>
        {stars === null && <p className="text-sm">{copy.flareWave.keyboardHint}</p>}
      </header>

      <div
        className="flare-wave__stage"
        role="group"
        tabIndex={0}
        aria-label={copy.flareWave.keyboardHint}
        onKeyDown={handleStageKeyDown}
      >
        {flares.map((flare) => (
          <button
            key={flare.id}
            className={`flare-wave__flare flare-wave__flare--${flare.speed}`}
            style={{ '--flare-x': `${flare.lane}%`, '--flare-duration': `${flare.duration}ms` }}
            aria-label={`${copy.flareWave.tapFlare} ${flare.id}`}
            onClick={() => resolveFlare(flare, true)}
            onAnimationEnd={() => resolveFlare(flare, false)}
          >
            <Sun aria-hidden="true" size={30} />
          </button>
        ))}
        {bursts.map((burst) => (
          <Sparkles
            key={burst.id}
            className="flare-wave__burst"
            style={{ '--burst-x': `${burst.lane}%` }}
            aria-hidden="true"
            size={32}
          />
        ))}
        <div className="flare-wave__dome" aria-hidden="true">
          <Home size={38} />
          <span>{copy.flareWave.dome}</span>
        </div>
      </div>

      <div
        className="flare-wave__progress"
        role="progressbar"
        aria-label={copy.flareWave.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      {missed && stars === null && (
        <p className="flare-wave__missed" aria-live="polite" aria-atomic="true">
          {copy.flareWave.missed}
        </p>
      )}

      {stars !== null && (
        <div className="flare-wave__result" role="status" aria-live="polite" aria-atomic="true">
          <div className="flare-wave__stars" aria-label={`${stars} ${copy.flareWave.starLabel}`}>
            {[1, 2, 3].map((star) => (
              <Star key={star} aria-hidden="true" fill={star <= stars ? 'currentColor' : 'none'} />
            ))}
          </div>
          <p>{resultLine}</p>
          {stars === 3 && (
            <div className="flare-wave__badge">
              <Star aria-hidden="true" fill="currentColor" size={20} />
              <span>{copy.flareWave.threeStarBadge}</span>
            </div>
          )}
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {tapAnnouncement}
      </span>
    </section>
  );
}
