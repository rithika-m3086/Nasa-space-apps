import React from 'react';
import { useState } from 'react';
import { HeartPulse, Leaf, Shield, Sparkles, Zap } from 'lucide-react';
import { useMission } from '../store/useMission.js';
import Starfield from '../components/Starfield.jsx';
import OutpostViewport from '../components/OutpostViewport.jsx';
import {
  BigButton,
  CapcomBubble,
  Card,
  DayRail,
  EnergyAllocator,
  GaugeRing,
  IconBadge,
  Modal,
  StatusFace,
  Toggle,
} from '../components/ui/index.js';
import { usePrefs } from './usePrefs.js';

function speak(text) {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

function updateScene(patch) {
  useMission.setState((state) => ({ ...state, ...patch }));
}

export default function DevGallery() {
  const state = useMission();
  const prefs = usePrefs();
  const [modalOpen, setModalOpen] = useState(false);
  const gauges = [
    { kind: 'power', value: state.gauges.power },
    { kind: 'life', value: state.gauges.life },
    { kind: 'shield', value: state.gauges.shield },
    { kind: 'science', value: state.science },
  ];
  const setGauge = (key, value) => updateScene({
    gauges: { ...state.gauges, [key]: Number(value) },
  });
  const setSite = (site) => updateScene({
    config: { ...state.config, site },
    sunlight: site === 'mars' ? 0.7 : 0.9,
    dust: site === 'mars' ? 0.3 : 0,
  });
  const setEventKind = (kind) => updateScene({
    event: kind === 'none' ? null : {
      id: `gallery-${kind}`,
      sites: [state.config.site],
      kind,
      title: 'Scene preview',
      kid: 'This is a scene preview.',
      why: 'Choose a different scene in the gallery controls.',
      options: [],
      science: { headline: 'Scene preview', mission: 'Gallery', instrument: 'Game estimate', fact: 'Preview only.', sourceId: 'TODO-VERIFY' },
    },
    step: kind === 'none' ? 'allocate' : 'event',
  });

  return (
    <main className="oc-page bg-[var(--color-bg)] text-[var(--color-text)]">
      <Starfield />
      <div className="oc-page__content">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-semibold text-[var(--color-power)]">OUTPOST COMMAND · UI LAB</p>
            <h1 className="oc-display text-4xl sm:text-5xl">Mission Control HUD</h1>
            <p className="mt-2 text-[var(--color-muted)]">A friendly test flight for every component.</p>
          </div>
          <Toggle
            label="Reduced motion"
            checked={Boolean(prefs.reducedMotion)}
            onChange={prefs.setReducedMotion}
          />
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <h2 className="oc-display mb-4 text-2xl">Outpost viewport</h2>
            <OutpostViewport />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex min-h-12 flex-col gap-2 text-sm font-semibold">
                Landing site
                <select
                  className="min-h-12 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
                  value={state.config.site}
                  onChange={(event) => setSite(event.target.value)}
                >
                  <option value="moon">Moon</option>
                  <option value="mars">Mars</option>
                </select>
              </label>
              <label className="flex min-h-12 flex-col gap-2 text-sm font-semibold">
                Event overlay
                <select
                  className="min-h-12 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
                  value={state.event?.kind || 'none'}
                  onChange={(event) => setEventKind(event.target.value)}
                >
                  <option value="none">No event</option>
                  <option value="flare">Solar flare</option>
                  <option value="dust">Dust storm</option>
                  <option value="micrometeorite">Micrometeorite</option>
                </select>
              </label>
              <label className="flex min-h-12 flex-col gap-2 text-sm font-semibold">
                Sunlight: {Math.round(state.sunlight * 100)}%
                <input
                  className="min-h-12 accent-[var(--color-warning)]"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.sunlight}
                  onChange={(event) => updateScene({ sunlight: Number(event.target.value) })}
                />
              </label>
              <label className="flex min-h-12 flex-col gap-2 text-sm font-semibold">
                Dust: {Math.round(state.dust * 100)}%
                <input
                  className="min-h-12 accent-[var(--color-warning)]"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.dust}
                  onChange={(event) => updateScene({ dust: Number(event.target.value) })}
                />
              </label>
              {Object.entries(state.gauges).map(([key, value]) => (
                <label key={key} className="flex min-h-12 flex-col gap-2 text-sm font-semibold capitalize">
                  {key}: {Math.round(value)}%
                  <input
                    className="min-h-12 accent-[var(--color-accent)]"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={value}
                    onChange={(event) => setGauge(key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="oc-display mb-4 text-2xl">Big buttons</h2>
            <div className="flex flex-wrap gap-3">
              <BigButton>Primary</BigButton>
              <BigButton variant="secondary">Secondary</BigButton>
              <BigButton variant="ghost">Ghost</BigButton>
              <BigButton loading>Loading</BigButton>
            </div>
          </Card>

          <Card>
            <h2 className="oc-display mb-4 text-2xl">Status faces</h2>
            <div className="flex flex-wrap gap-5">
              <StatusFace value={80} />
              <StatusFace value={45} />
              <StatusFace value={18} />
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="oc-display mb-5 text-2xl">Mission gauges</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {gauges.map((gauge) => <GaugeRing key={gauge.kind} {...gauge} />)}
            </div>
          </Card>

          <Card>
            <h2 className="oc-display mb-4 text-2xl">Energy plan</h2>
            <EnergyAllocator />
          </Card>

          <Card>
            <h2 className="oc-display mb-4 text-2xl">Mission days</h2>
            <DayRail day={state.day} site={state.config.site} />
            <div className="mt-5 border-t border-white/10 pt-2">
              <DayRail day={7} site="mars" />
            </div>
          </Card>

          <Card>
            <h2 className="oc-display mb-4 text-2xl">CAPCOM</h2>
            <CapcomBubble
              message={state.lastOutcome?.capcom || state.event?.kid || 'Welcome, Flight Director! Your crew is ready.'}
              onSpeak={speak}
            />
          </Card>

          <Card>
            <h2 className="oc-display mb-4 text-2xl">Badges and switches</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <IconBadge icon={Zap} color="var(--color-power)">Power</IconBadge>
              <IconBadge icon={HeartPulse} color="var(--color-life)">Life</IconBadge>
              <IconBadge icon={Shield} color="var(--color-shield)">Shield</IconBadge>
              <IconBadge icon={Leaf} color="var(--color-science)">Science</IconBadge>
            </div>
            <Toggle label="Crew check-ins" checked onChange={() => {}} />
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="oc-display mb-3 text-2xl">Mission dialog</h2>
            <p className="mb-4 text-[var(--color-muted)]">Open the dialog to check keyboard focus and Escape.</p>
            <BigButton onClick={() => setModalOpen(true)}>
              <Sparkles aria-hidden="true" size={20} />
              Open modal
            </BigButton>
          </Card>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Crew check-in">
        <p className="mb-5 text-[var(--color-muted)]">Your crew is ready for the next step.</p>
        <BigButton onClick={() => setModalOpen(false)}>Sounds good</BigButton>
      </Modal>
    </main>
  );
}
