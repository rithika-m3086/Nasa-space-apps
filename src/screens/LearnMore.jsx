import React, { useState } from 'react';
import { normalizeClassCode, useMission } from '../store/useMission.js';
import CitationsModal from '../components/CitationsModal.jsx';
import RealSunBanner from '../components/RealSunBanner.jsx';
import { BigButton, Card } from '../components/ui/index.js';
import { sources } from '../data/sources.js';
import { sites } from '../data/sites.js';

function ScienceDrawer({ science, siteFact }) {
  const fact = science?.fact || siteFact?.kid;
  if (!fact) return null;
  const source = sources.find((item) => item.id === (science?.sourceId || siteFact?.sourceId));

  return (
    <Card>
      <details>
        <summary className="min-h-12 cursor-pointer py-3 font-semibold">
          Science behind your mission
        </summary>
        <div className="grid gap-2 border-t border-white/10 pt-4">
          <h2 className="oc-display text-xl">{science?.headline || 'A fact about your mission'}</h2>
          {science?.mission && <p><strong>Mission:</strong> {science.mission}</p>}
          {science?.instrument && <p><strong>Instrument:</strong> {science.instrument}</p>}
          <p>{fact}</p>
          {source?.url.startsWith('http') ? (
            <a
              className="inline-flex min-h-11 items-center text-[var(--color-power)] underline"
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              Source: {source.title}
            </a>
          ) : (
            <p className="text-sm text-[var(--color-warning)]">Source link needs review.</p>
          )}
        </div>
      </details>
    </Card>
  );
}

export default function LearnMore({ onBack, onClass }) {
  const science = useMission((state) => state.event?.science);
  const site = useMission((state) => state.config.site);
  const siteFact = sites[site]?.facts[0];
  const [classCode, setClassCode] = useState('');
  const normalizedCode = normalizeClassCode(classCode);

  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <Card>
        <BigButton variant="ghost" className="mb-3" onClick={onBack}>Back</BigButton>
        <h1 className="oc-display text-4xl">Learn more</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Explore space facts and join your classroom mission.
        </p>
      </Card>
      <RealSunBanner />
      <ScienceDrawer science={science} siteFact={siteFact} />
      <Card>
        <h2 className="oc-display text-2xl">Join a classroom mission</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (normalizedCode) onClass(normalizedCode);
          }}
        >
          <label className="oc-sr-only" htmlFor="class-code">Class code</label>
          <input
            id="class-code"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
            value={classCode}
            maxLength={40}
            placeholder="Type your class code"
            onChange={(event) => setClassCode(event.target.value)}
          />
          <BigButton type="submit" variant="secondary" disabled={!normalizedCode}>Join</BigButton>
        </form>
      </Card>
      <Card>
        <h2 className="oc-display mb-2 text-2xl">Research and sources</h2>
        <p className="mb-3 text-[var(--color-muted)]">See where our space facts come from.</p>
        <CitationsModal />
      </Card>
    </section>
  );
}
