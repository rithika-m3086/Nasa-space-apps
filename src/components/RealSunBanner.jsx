import React from 'react';
import { useEffect } from 'react';
import { sources } from '../data/sources.js';
import { useMission } from '../store/useMission.js';

export default function RealSunBanner() {
  const sun = useMission((state) => state.live.sun);
  const fetchRealSun = useMission((state) => state.fetchRealSun);

  useEffect(() => {
    fetchRealSun();
  }, [fetchRealSun]);

  const source = sources.find((item) => item.id === 'donki');
  const label = sun.source === 'live' ? 'Live from NASA' : 'Saved from NASA';

  return (
    <aside className="oc-panel p-4" aria-live="polite">
      <p className="font-semibold">{sun.text || 'Space-weather updates are ready.'}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {label} · {sun.date || 'Saved snapshot'}
      </p>
      {source && (
        <a className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--color-power)] underline" href={source.url} target="_blank" rel="noreferrer">
          NASA space-weather source
        </a>
      )}
    </aside>
  );
}
