import React from 'react';
import { sources } from '../../data/sources.js';
import { radiationReality } from '../../data/radiationReality.js';
import { Card } from '../../components/ui/index.js';

function SourceLink({ sourceId }) {
  const source = sources.find((item) => item.id === sourceId);
  if (!source || !source.url.startsWith('http')) {
    return <span className="text-sm text-[var(--color-muted)]">Source link needs review.</span>;
  }
  return (
    <a
      className="inline-flex min-h-11 items-center text-sm text-[var(--color-power)] underline"
      href={source.url}
      target="_blank"
      rel="noreferrer"
    >
      {source.title}
    </a>
  );
}

export default function RadiationMeter({ radiation }) {
  const refs = radiation?.refs || [];
  const maxDose = Math.max(0.1, ...refs.map((ref) => ref.msvPerDay || 0));
  const estimate = radiation?.crewDoseMsvPerDay || 0;
  const estimateWidth = Math.min(100, (estimate / maxDose) * 100);

  return (
    <Card>
      <h2 className="oc-display text-2xl">Radiation Reality Meter</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Real space trips have different radiation levels. These bars help compare.
      </p>
      <div className="mt-4 grid gap-4">
        <div>
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <strong>Your crew · Game estimate</strong>
            <span>{estimate.toFixed(2)} mSv/day</span>
          </div>
          <div
            className="mt-2 h-4 overflow-hidden rounded-full bg-white/10"
            role="meter"
            aria-label="Your crew's estimated daily radiation dose"
            aria-valuemin="0"
            aria-valuemax={maxDose}
            aria-valuenow={estimate}
          >
            <div className="h-full rounded-full bg-[var(--color-science)]" style={{ width: `${estimateWidth}%` }} />
          </div>
        </div>
        {refs.map((ref) => {
          const width = Math.min(100, ((ref.msvPerDay || 0) / maxDose) * 100);
          const kidEquivalent = radiationReality.kidEquivalents
            .find((item) => item.refId === ref.id);
          return (
            <div key={ref.id}>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <strong>{ref.label}</strong>
                <span>{ref.msvPerDay} mSv/day</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${width}%` }} />
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {kidEquivalent?.kid || ref.note}
              </p>
              <SourceLink sourceId={ref.sourceId} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
