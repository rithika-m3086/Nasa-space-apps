import { useState } from 'react';
import { HeartPulse, Leaf, Shield, Sparkles, Zap } from 'lucide-react';
import { useMission } from '../store/useMission.js';
import Starfield from '../components/Starfield.jsx';
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
