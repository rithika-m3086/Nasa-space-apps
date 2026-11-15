import { useCallback, useEffect, useState } from 'react';

let reducedMotionOverride = null;
const listeners = new Set();

export function usePrefs() {
  const [reducedMotion, setValue] = useState(reducedMotionOverride);

  useEffect(() => {
    const listener = (value) => setValue(value);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const setReducedMotion = useCallback((value) => {
    reducedMotionOverride = value == null ? null : Boolean(value);
    if (typeof document !== 'undefined') {
      if (reducedMotionOverride == null) document.documentElement.removeAttribute('data-motion');
      else document.documentElement.setAttribute('data-motion', reducedMotionOverride ? 'reduce' : 'full');
    }
    listeners.forEach((listener) => listener(reducedMotionOverride));
  }, []);

  return { reducedMotion, setReducedMotion };
}
