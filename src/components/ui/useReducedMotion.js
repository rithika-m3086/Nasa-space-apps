import { useReducedMotion as useSystemReducedMotion } from 'framer-motion';
import { usePrefs } from '../../screens/usePrefs.js';

export function useReducedMotion() {
  const systemPreference = useSystemReducedMotion();
  const preference = usePrefs((state) => state.reducedMotion);
  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return systemPreference ?? false;
}
