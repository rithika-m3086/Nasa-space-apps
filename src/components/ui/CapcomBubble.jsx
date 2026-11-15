import React from 'react';
import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import BigButton from './BigButton.jsx';
import { useReducedMotion } from './useReducedMotion.js';
import { usePrefs } from '../../screens/usePrefs.js';
import { speak } from '../../voice/speak.js';

export default function CapcomBubble({ message, onSpeak }) {
  const reducedMotion = useReducedMotion();
  const readAloud = usePrefs((state) => state.readAloud);
  const lang = usePrefs((state) => state.lang);
  const [shown, setShown] = useState(reducedMotion ? message : '');

  useEffect(() => {
    if (reducedMotion) {
      setShown(message);
      return undefined;
    }
    let index = 0;
    setShown('');
    const timer = window.setInterval(() => {
      index += 1;
      setShown(message.slice(0, index));
      if (index >= message.length) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [message, reducedMotion]);

  useEffect(() => {
    if (readAloud === 'capcom') speak(message, { lang, rate: 0.9 });
  }, [lang, message, readAloud]);

  const speakMessage = onSpeak || ((text) => speak(text, { lang, rate: 0.9 }));

  return (
    <div className="oc-bubble">
      <p className="oc-bubble__text" aria-hidden="true">{shown}</p>
      <p className="oc-sr-only" aria-live="polite" aria-atomic="true">{shown === message ? message : ''}</p>
      <BigButton
        variant="ghost"
        className="oc-icon-button shrink-0"
        aria-label="Read CAPCOM message aloud"
        onClick={() => speakMessage(message)}
      >
        <Volume2 aria-hidden="true" size={22} />
      </BigButton>
    </div>
  );
}
