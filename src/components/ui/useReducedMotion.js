import { useReducedMotion as useSystemReducedMotion } from 'framer-motion';
import { usePrefs } from '../../screens/usePrefs.js';

export function useReducedMotion() {
  const systemPreference = useSystemReducedMotion();
  const { reducedMotion } = usePrefs();
  return reducedMotion ?? systemPreference ?? false;
}
