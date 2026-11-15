import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import BigButton from './BigButton.jsx';
import { useReducedMotion } from './useReducedMotion.js';

export default function CapcomBubble({ message, onSpeak }) {
  const reducedMotion = useReducedMotion();
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

  return (
    <div className="oc-bubble">
      <p className="oc-bubble__text" aria-hidden="true">{shown}</p>
      <p className="oc-sr-only" aria-live="polite" aria-atomic="true">{shown === message ? message : ''}</p>
      {onSpeak && (
        <BigButton
          variant="ghost"
          className="oc-icon-button shrink-0"
          aria-label="Read CAPCOM message aloud"
          onClick={() => onSpeak(message)}
        >
          <Volume2 aria-hidden="true" size={22} />
        </BigButton>
      )}
    </div>
  );
}
