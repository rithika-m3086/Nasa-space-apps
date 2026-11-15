import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialPreferences = {
  muted: false,
  volume: 0.55,
  reducedMotion: 'auto',
  readAloud: 'off',
  lang: 'en-US',
  textScale: 'A',
  tutorialSeen: false,
  patchDesign: null,
};

export const usePrefs = create(
  persist(
    (set) => ({
      ...initialPreferences,
      patch: (preferences) => set((state) => ({ ...state, ...preferences })),
    }),
    {
      name: 'aphelion.prefs',
      storage: createJSONStorage(() => (
        typeof window === 'undefined' ? undefined : window.localStorage
      )),
      partialize: ({
        muted,
        volume,
        reducedMotion,
        readAloud,
        lang,
        textScale,
        tutorialSeen,
        patchDesign,
      }) => ({
        muted,
        volume,
        reducedMotion,
        readAloud,
        lang,
        textScale,
        tutorialSeen,
        patchDesign,
      }),
    },
  ),
);
