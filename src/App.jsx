import React from 'react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useMission,
  selectAllocationTip,
  selectShouldSuggestBreak,
  selectStickerCatalog,
} from './store/useMission.js';
import { getDailySeed } from './engine/index.js';
import { useReducedMotion } from './components/ui/useReducedMotion.js';
import CitationsModal from './components/CitationsModal.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';
import Starfield from './components/Starfield.jsx';
import DevGallery from './screens/DevGallery.jsx';
import HealthyOrbitModal from './screens/HealthyOrbitModal.jsx';
const Allocate = lazy(() => import('./screens/Allocate.jsx'));
const Briefing = lazy(() => import('./screens/Briefing.jsx'));
const CheckIn = lazy(() => import('./screens/CheckIn.jsx'));
const Ended = lazy(() => import('./screens/Ended.jsx'));
const EventCard = lazy(() => import('./screens/EventCard.jsx'));
const Report = lazy(() => import('./screens/Report.jsx'));
const SafeOrbit = lazy(() => import('./screens/SafeOrbit.jsx'));
const StickerAlbum = lazy(() => import('./screens/StickerAlbum.jsx'));
const TeacherKit = lazy(() => import('./screens/TeacherKit.jsx'));
const Title = lazy(() => import('./screens/Title.jsx'));
import { usePrefs } from './screens/usePrefs.js';
import { speak } from './voice/speak.js';
import './screens/flow.css';
import './screens/classroom.css';

const ROUTES = new Set(['#/', '#/album', '#/teacher', '#/safe', '#/dev']);

function stateScreen(state) {
  if (state.status === 'idle') return 'title';
  if (state.status === 'ended') return 'ended';
  if (state.step === 'event') return 'event';
  if (state.step === 'report') return 'report';
  return 'allocate';
}

function ScreenSkeleton() {
  return (
    <div className="oc-screen-skeleton" role="status" aria-label="Loading screen">
      <span className="oc-screen-skeleton__line oc-screen-skeleton__line--title" />
      <span className="oc-screen-skeleton__line" />
      <span className="oc-screen-skeleton__line oc-screen-skeleton__line--short" />
      <span className="oc-screen-skeleton__panel" />
    </div>
  );
}

export default function App() {
  const state = useMission();
  const startMission = useMission((mission) => mission.startMission);
  const resetMission = useMission((mission) => mission.resetMission);
  const prefs = usePrefs();
  const [hash, setHash] = useState(() => (typeof window === 'undefined' ? '' : window.location.hash));
  const [dismissedBreakFor, setDismissedBreakFor] = useState(null);
  const [unlockedToast, setUnlockedToast] = useState('');
  const previousStickerIds = useRef(state.profile.stickers);
  const [flow, setFlow] = useState(() => {
    if (typeof window === 'undefined') return null;
    const hasPreviewStep = new URLSearchParams(window.location.search).has('s');
    return !hasPreviewStep && useMission.getState().profile.missionsPlayed === 0 ? 'title' : null;
  });
  const reducedMotion = useReducedMotion();
  const stickerCatalog = useMemo(() => selectStickerCatalog(state), [state.profile.stickers]);
  const announcedScreen = hash === '#/dev'
    ? 'dev'
    : hash === '#/album'
      ? 'album'
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
    if (hash && !ROUTES.has(hash)) window.location.hash = '#/';
  }, [hash]);

  useEffect(() => {
    const previous = new Set(previousStickerIds.current);
    const newlyUnlocked = state.profile.stickers.filter((id) => !previous.has(id));
    previousStickerIds.current = state.profile.stickers;
    if (!newlyUnlocked.length) return undefined;

    const names = newlyUnlocked
      .map((id) => stickerCatalog.find((sticker) => sticker.id === id)?.name)
      .filter(Boolean);
    if (!names.length) return undefined;
    setUnlockedToast(`Sticker unlocked: ${names.join(', ')}`);
    const timer = window.setTimeout(() => setUnlockedToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [state.profile.stickers, stickerCatalog]);

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
  if (hash === '#/album') {
    screenKey = 'album';
    screen = <StickerAlbum />;
  } else if (hash === '#/teacher') {
    screenKey = 'teacher';
    screen = <TeacherKit />;
  } else if (hash === '#/safe') {
    screenKey = 'safe';
    screen = <SafeOrbit />;
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

  const breakEligible = !['#/album', '#/teacher', '#/safe'].includes(hash)
    && state.status === 'ended'
    && selectShouldSuggestBreak(state);
  const breakOpen = breakEligible && dismissedBreakFor !== state.profile.missionsPlayed;

  return (
    <main className="oc-page bg-[var(--color-bg)] px-4 text-[var(--color-text)]">
      <Starfield />
      <div className="oc-page__content">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <nav className="oc-route-nav" aria-label="Outpost pages">
            <a href="#/">Mission</a>
            <a href="#/album">Sticker album</a>
            <a href="#/teacher">Teacher kit</a>
            <a href="#/safe">Why this is safe</a>
          </nav>
          <SettingsSheet />
        </header>
        <AnimatePresence>
          {unlockedToast && (
            <motion.div
              className="oc-unlock-toast"
              role="status"
              initial={reducedMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
            >
              {unlockedToast}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screenKey}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
          >
            <Suspense fallback={<ScreenSkeleton />}>{screen}</Suspense>
          </motion.div>
        </AnimatePresence>
        <footer className="mt-8 flex justify-center border-t border-white/10 pt-4">
          <CitationsModal />
        </footer>
      </div>
      <HealthyOrbitModal
        open={breakOpen}
        reducedMotion={reducedMotion}
        onClose={() => setDismissedBreakFor(state.profile.missionsPlayed)}
      />
    </main>
  );
}
