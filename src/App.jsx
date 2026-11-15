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
import Starfield from './components/Starfield.jsx';
import HealthyOrbitModal from './screens/HealthyOrbitModal.jsx';
const Allocate = lazy(() => import('./screens/Allocate.jsx'));
const CheckIn = lazy(() => import('./screens/CheckIn.jsx'));
const FirstMission = lazy(() => import('./screens/FirstMission.jsx'));
const HowToPlay = lazy(() => import('./screens/HowToPlay.jsx'));
const LearnMore = lazy(() => import('./screens/LearnMore.jsx'));
const Play = lazy(() => import('./screens/Play.jsx'));
const PlanetMap = lazy(() => import('./screens/PlanetMap.jsx'));
const Result = lazy(() => import('./screens/Result.jsx'));
const SafeOrbit = lazy(() => import('./screens/SafeOrbit.jsx'));
const StickerAlbum = lazy(() => import('./screens/StickerAlbum.jsx'));
const TeacherKit = lazy(() => import('./screens/TeacherKit.jsx'));
const Title = lazy(() => import('./screens/Title.jsx'));
const DevGallery = import.meta.env.DEV
  ? lazy(() => import('./screens/DevGallery.jsx'))
  : null;
import { usePrefs } from './screens/usePrefs.js';
import { speak } from './voice/speak.js';
import './screens/flow.css';
import './screens/classroom.css';

const ROUTES = new Set([
  '#/',
  '#/how',
  '#/learn',
  '#/album',
  '#/teacher',
  '#/safe',
  ...(import.meta.env.DEV ? ['#/dev'] : []),
]);

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
  const [checkInSite, setCheckInSite] = useState('moon');
  const [tutorialStep, setTutorialStep] = useState(null);
  const [dismissedBreakFor, setDismissedBreakFor] = useState(null);
  const [unlockedToast, setUnlockedToast] = useState('');
  const previousStickerIds = useRef(state.profile.stickers);
  const hasPreviewStep = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('s');
  const [flow, setFlow] = useState(() => {
    if (typeof window === 'undefined') return null;
    return !hasPreviewStep && useMission.getState().profile.missionsPlayed === 0 ? 'title' : null;
  });
  const reducedMotion = useReducedMotion();
  const stickerCatalog = useMemo(() => selectStickerCatalog(state), [state.profile.stickers]);
  // The seeded fixture starts running, but a fresh profile still needs the entry flow.
  const isPlaying = state.status === 'running'
    && (state.profile.missionsPlayed > 0
      || (hasPreviewStep && !['#/how', '#/learn', '#/album', '#/teacher', '#/safe'].includes(hash)));
  const announcedScreen = import.meta.env.DEV && hash === '#/dev' && !isPlaying
    ? 'dev'
    : isPlaying
      ? 'play'
      : hash === '#/how'
        ? 'how'
        : hash === '#/learn'
          ? 'learn'
          : hash === '#/album'
            ? 'album'
            : hash === '#/teacher'
              ? 'teacher'
              : hash === '#/safe'
                ? 'safe'
                : state.status === 'ended'
                  ? 'result'
                  : flow || (state.status === 'ended' ? 'result' : 'title');
  const capcomLine = announcedScreen === 'play' && state.step === 'allocate'
    ? selectAllocationTip(state)
    : announcedScreen === 'play' && state.step === 'report'
      ? state.lastOutcome?.capcom || ''
      : announcedScreen === 'play' && state.step === 'event'
        ? state.event?.kid || ''
      : import.meta.env.DEV && announcedScreen === 'dev'
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
    if (prefs.readAloud !== 'all' || announcedScreen === 'how') return undefined;
    const timer = window.setTimeout(() => {
      const heading = document.querySelector('.oc-page h1, .oc-page h2')?.textContent?.trim();
      const announcement = [heading, capcomLine].filter(Boolean).join('. ');
      if (announcement) speak(announcement, { lang: prefs.lang, rate: 0.9 });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [announcedScreen, capcomLine, prefs.lang, prefs.readAloud, state.day]);

  const beginMission = (config) => {
    startMission(config);
    setFlow(null);
    setTutorialStep(prefs.tutorialSeen ? null : -1);
    if (window.location.hash !== '#/') window.location.hash = '#/';
  };
  const finishTutorial = useCallback(() => {
    prefs.patch({ tutorialSeen: true });
    setTutorialStep(null);
  }, [prefs.patch]);
  const replayTutorial = useCallback(() => {
    setTutorialStep(-1);
  }, []);
  const playAgain = () => {
    resetMission();
    setFlow('checkin');
    if (window.location.hash !== '#/') window.location.hash = '#/';
  };
  const nextMission = () => {
    const config = state.config.site === 'moon'
      ? { ...state.config, site: 'mars' }
      : { ...state.config, mode: 'daily', seed: getDailySeed() };
    startMission(config);
    setFlow(null);
    setTutorialStep(null);
    if (window.location.hash !== '#/') window.location.hash = '#/';
  };

  if (import.meta.env.DEV && hash === '#/dev' && !isPlaying && DevGallery) {
    return (
      <Suspense fallback={<ScreenSkeleton />}>
        <DevGallery />
      </Suspense>
    );
  }

  let screenKey = flow || 'title';
  let screen;
  if (isPlaying) {
    screenKey = 'play';
    screen = (
      <Play
        guidedStep={tutorialStep === null ? null : Math.max(0, tutorialStep)}
        onReplayTutorial={replayTutorial}
      />
    );
  } else if (hash === '#/how') {
    screenKey = 'how';
    screen = (
      <HowToPlay
        onContinue={() => {
          setFlow('planet-map');
          if (window.location.hash !== '#/') window.location.hash = '#/';
        }}
      />
    );
  } else if (hash === '#/learn') {
    screenKey = 'learn';
    screen = (
      <LearnMore
        onBack={() => { window.location.hash = '#/'; }}
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
  } else if (hash === '#/album') {
    screenKey = 'album';
    screen = <StickerAlbum />;
  } else if (hash === '#/teacher') {
    screenKey = 'teacher';
    screen = <TeacherKit />;
  } else if (hash === '#/safe') {
    screenKey = 'safe';
    screen = <SafeOrbit />;
  } else if (state.status === 'ended') {
    screenKey = 'result';
    screen = (
      <Result
        onPlayAgain={playAgain}
        onNextMission={nextMission}
        onNavigate={(target) => { window.location.hash = target; }}
      />
    );
  } else if (flow === 'planet-map') {
    screenKey = 'planet-map';
    screen = (
      <PlanetMap
        onSelectSite={(site) => {
          setCheckInSite(site);
          setFlow('checkin');
        }}
        onBack={() => setFlow('title')}
      />
    );
  } else if (flow === 'checkin') {
    screenKey = 'checkin';
    screen = (
      <CheckIn
        onStart={beginMission}
        onBack={() => setFlow('planet-map')}
        initialSite={checkInSite}
      />
    );
  } else {
    screenKey = 'title';
    screen = (
      <Title
        onPlay={() => setFlow('planet-map')}
        onHowToPlay={() => {
          setFlow(null);
          window.location.hash = '#/how';
        }}
      />
    );
  }

  const breakEligible = screenKey === 'result'
    && selectShouldSuggestBreak(state);
  const breakOpen = breakEligible && dismissedBreakFor !== state.profile.missionsPlayed;

  return (
    <main className="oc-page bg-[var(--color-bg)] px-4 text-[var(--color-text)]">
      <Starfield />
      <div className="oc-page__content">
        {tutorialStep !== null && isPlaying && (
          <Suspense fallback={<ScreenSkeleton />}>
            <FirstMission
              step={tutorialStep}
              onStepChange={setTutorialStep}
              onFinish={finishTutorial}
            />
          </Suspense>
        )}
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
      </div>
      <HealthyOrbitModal
        open={breakOpen}
        reducedMotion={reducedMotion}
        onClose={() => setDismissedBreakFor(state.profile.missionsPlayed)}
      />
    </main>
  );
}
