import React from 'react';
import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { BigButton, Modal, Toggle } from './ui/index.js';
import { isSupported, speak } from '../voice/speak.js';
import { usePrefs } from '../screens/usePrefs.js';

const motionOptions = [
  { value: 'auto', label: 'Use device setting' },
  { value: 'on', label: 'Reduce motion' },
  { value: 'off', label: 'Allow motion' },
];
const voiceOptions = [
  { value: 'off', label: 'Off' },
  { value: 'capcom', label: 'CAPCOM lines' },
  { value: 'all', label: 'Pre-reader mode (all text)' },
];
const textOptions = ['A', 'A+', 'A++'];

export default function SettingsSheet({ onReplayTutorial }) {
  const [open, setOpen] = useState(false);
  const preferences = usePrefs();
  const patch = preferences.patch;

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.reducedMotion === 'auto') root.removeAttribute('data-motion');
    else root.setAttribute('data-motion', preferences.reducedMotion === 'on' ? 'reduce' : 'full');
  }, [preferences.reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.textScale = preferences.textScale;
  }, [preferences.textScale]);

  return (
    <>
      <BigButton
        variant="ghost"
        className="oc-icon-button"
        aria-label="Open accessibility and sound settings"
        onClick={() => setOpen(true)}
      >
        <Settings aria-hidden="true" />
      </BigButton>
      <Modal open={open} onClose={() => setOpen(false)} title="Sound and access">
        <div className="grid gap-5">
          <section aria-label="Sound settings" className="grid gap-3">
            <h3 className="font-semibold">Sound</h3>
            <Toggle label="Mute sounds" checked={preferences.muted} onChange={(muted) => patch({ muted })} />
            <label className="grid gap-2 text-sm font-semibold" htmlFor="master-volume">
              Volume · {Math.round(preferences.volume * 100)}%
              <input
                id="master-volume"
                className="min-h-12 w-full accent-[var(--color-power)]"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={preferences.volume}
                aria-valuetext={`${Math.round(preferences.volume * 100)} percent`}
                onChange={(event) => patch({ volume: Number(event.target.value) })}
              />
            </label>
          </section>

          <label className="grid gap-2 text-sm font-semibold" htmlFor="motion-setting">
            Reduced motion
            <select
              id="motion-setting"
              className="min-h-12 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
              value={preferences.reducedMotion}
              onChange={(event) => patch({ reducedMotion: event.target.value })}
            >
              {motionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold" htmlFor="read-aloud-setting">
            Read aloud
            <select
              id="read-aloud-setting"
              className="min-h-12 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
              value={preferences.readAloud}
              onChange={(event) => patch({ readAloud: event.target.value })}
            >
              {voiceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <section>
            <h3 className="mb-2 font-semibold">Text size</h3>
            <div className="flex flex-wrap gap-2">
              {textOptions.map((scale) => (
                <BigButton
                  key={scale}
                  variant={preferences.textScale === scale ? 'primary' : 'secondary'}
                  aria-pressed={preferences.textScale === scale}
                  onClick={() => patch({ textScale: scale })}
                >
                  {scale}
                </BigButton>
              ))}
            </div>
          </section>

          <label className="grid gap-2 text-sm font-semibold" htmlFor="language-setting">
            Language · more languages soon
            <select
              id="language-setting"
              className="min-h-12 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3 text-[var(--color-text)]"
              value={preferences.lang}
              onChange={(event) => patch({ lang: event.target.value })}
            >
              <option value="en-US">English</option>
              <option value="es-ES" disabled>More languages soon</option>
            </select>
          </label>
          <BigButton
            variant="secondary"
            disabled={!isSupported()}
            onClick={() => speak('Hello, Flight Director. Your crew is ready to explore.', { lang: preferences.lang })}
          >
            Test voice
          </BigButton>
          {onReplayTutorial && (
            <BigButton
              variant="secondary"
              onClick={() => {
                setOpen(false);
                onReplayTutorial();
              }}
            >
              Replay the tutorial
            </BigButton>
          )}
        </div>
      </Modal>
    </>
  );
}
