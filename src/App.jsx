import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMission, selectAllocationTip } from './store/useMission.js';
import { getDailySeed } from './engine/index.js';
import { useReducedMotion } from './components/ui/useReducedMotion.js';
import { BigButton, Card } from './components/ui/index.js';
import CitationsModal from './components/CitationsModal.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';
import Starfield from './components/Starfield.jsx';
import DevGallery from './screens/DevGallery.jsx';
import Allocate from './screens/Allocate.jsx';
import Briefing from './screens/Briefing.jsx';
import CheckIn from './screens/CheckIn.jsx';
import Ended from './screens/Ended.jsx';
import EventCard from './screens/EventCard.jsx';
import Report from './screens/Report.jsx';
import Title from './screens/Title.jsx';
import { usePrefs } from './screens/usePrefs.js';
import { speak } from './voice/speak.js';
import './screens/flow.css';

function stateScreen(state) {
  if (state.status === 'idle') return 'title';
  if (state.status === 'ended') return 'ended';
  if (state.step === 'event') return 'event';
  if (state.step === 'report') return 'report';
  return 'allocate';
}

function ReservedScreen({ title, text }) {
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <h1 className="oc-display text-4xl">{title}</h1>
      <p className="my-4 text-[var(--color-muted)]">{text}</p>
      <BigButton onClick={() => { window.location.hash = '#/'; }}>Return to the mission</BigButton>
    </Card>
  );
}

export default function App() {
  const state = useMission();
  const startMission = useMission((mission) => mission.startMission);
  const resetMission = useMission((mission) => mission.resetMission);
  const activateSafeMode = useMission((mission) => mission.activateSafeMode);
  const prefs = usePrefs();
  const [hash, setHash] = useState(() => (typeof window === 'undefined' ? '' : window.location.hash));
  const [flow, setFlow] = useState(() => {
    if (typeof window === 'undefined') return null;
    const hasPreviewStep = new URLSearchParams(window.location.search).has('s');
    return !hasPreviewStep && useMission.getState().profile.missionsPlayed === 0 ? 'title' : null;
  });
  const reducedMotion = useReducedMotion();
  const announcedScreen = hash === '#/dev'
    ? 'dev'
    : hash === '#/teacher'
      ? 'teacher'
      : hash === '#/safe'
        ? 'safe'
        : flow || stateScreen(state);
  const capcomLine = announcedScreen === 'allocate' || announcedScreen === 'briefing'
    ? selectAllocationTip(state)
    : announcedScreen === 'report'
      ? state.lastOutcome?.capcom || ''
      : announcedScreen === 'dev'
      ? state.lastOutcome?.capcom || state.event?.kid || 'Welcome, Flight Director! Your crew is ready.'
        : '';

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (prefs.readAloud !== 'all') return undefined;
    const timer = window.setTimeout(() => {
      const heading = document.querySelector('.oc-page h1, .oc-page h2')?.textContent?.trim();
      const announcement = [heading, capcomLine].filter(Boolean).join('. ');
      if (announcement) speak(announcement, { lang: prefs.lang, rate: 0.9 });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [announcedScreen, capcomLine, prefs.lang, prefs.readAloud, state.day]);

  const beginMission = (config) => {
    startMission(config);
    setFlow(prefs.tutorialSeen ? null : 'briefing');
  };
  const finishBriefing = useCallback(() => {
    prefs.patch({ tutorialSeen: true });
    setFlow(null);
  }, [prefs.patch]);
  const playAgain = () => {
    resetMission();
    setFlow('checkin');
  };

  if (hash === '#/dev') return <DevGallery />;

  let screenKey = flow || stateScreen(state);
  let screen;
  if (hash === '#/teacher') {
    screenKey = 'teacher';
    screen = <ReservedScreen title="Classroom tools" text="Teacher tools are getting ready for your class." />;
  } else if (hash === '#/safe') {
    screenKey = 'safe';
    screen = (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="oc-display text-4xl">Low-Power Safe Mode</h1>
        <p className="my-4 text-[var(--color-muted)]">A little boost can help your crew plan the next step.</p>
        <BigButton disabled={!state.safeModeAvailable} onClick={() => activateSafeMode()}>
          {state.safeModeAvailable ? 'Give the crew a boost' : 'Safe Mode used'}
        </BigButton>
        <BigButton variant="ghost" className="ml-2" onClick={() => { window.location.hash = '#/'; }}>
          Back to mission
        </BigButton>
      </Card>
    );
  } else if (flow === 'title' || screenKey === 'title') {
    screenKey = 'title';
    screen = (
      <Title
        onPlay={() => setFlow('checkin')}
        onDaily={() => beginMission({
          cadetName: 'Cadet Nova',
          avatar: 'violet',
          site: 'moon',
          difficulty: 'cadet',
          mode: 'daily',
          seed: getDailySeed(),
        })}
        onClass={(code) => beginMission({
          cadetName: 'Cadet Nova',
          avatar: 'cyan',
          site: 'moon',
          difficulty: 'cadet',
          mode: 'class',
          seed: code,
        })}
      />
    );
  } else if (flow === 'checkin') {
    screenKey = 'checkin';
    screen = <CheckIn onStart={beginMission} onBack={() => setFlow('title')} />;
  } else if (flow === 'briefing') {
    screenKey = 'briefing';
    screen = (
      <div className="relative">
        <Allocate />
        <Briefing onDone={finishBriefing} />
      </div>
    );
  } else if (screenKey === 'event') {
    screen = <EventCard />;
  } else if (screenKey === 'report') {
    screen = <Report />;
  } else if (screenKey === 'ended') {
    screen = <Ended onPlayAgain={playAgain} />;
  } else {
    screenKey = 'allocate';
    screen = <Allocate />;
  }

  return (
    <main className="oc-page bg-[var(--color-bg)] px-4 text-[var(--color-text)]">
      <Starfield />
      <div className="oc-page__content">
        <header className="mb-4 flex justify-end">
          <SettingsSheet />
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screenKey}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
          >
            {screen}
          </motion.div>
        </AnimatePresence>
        <footer className="mt-8 flex justify-center border-t border-white/10 pt-4">
          <CitationsModal />
        </footer>
      </div>
    </main>
  );
}
