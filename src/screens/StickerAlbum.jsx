import React, { useState } from 'react';
import { Battery, BadgeCheck, Compass, Heart, Lightbulb, Lock, Moon, Orbit, Rocket, Shield, Sparkles, Sun, Telescope, Users, Wind, Zap } from 'lucide-react';
import { sources } from '../data/sources.js';
import { selectStickerCatalog, useMission } from '../store/useMission.js';
import { BigButton, Card, Modal } from '../components/ui/index.js';
import { stickerFacts } from './classroomData.js';

const stickerIcons = [
  Sparkles, Battery, Heart, Shield, Telescope, Moon, Orbit, Sun,
  Wind, Users, Compass, Lightbulb, Rocket, BadgeCheck, Zap, Orbit,
];

export default function StickerAlbum() {
  const state = useMission();
  const stickers = selectStickerCatalog(state);
  const [selectedId, setSelectedId] = useState(null);
  const unlocked = stickers.filter((sticker) => sticker.unlocked).length;
  const selected = stickers.find((sticker) => sticker.id === selectedId);
  const detail = selected ? stickerFacts[selected.id] : null;
  const source = detail ? sources.find((item) => item.id === detail.sourceId) : null;

  return (
    <section className="mx-auto grid max-w-4xl gap-5">
      <Card>
        <p className="font-semibold text-[var(--color-power)]">CREW COLLECTION</p>
        <h1 className="oc-display mt-1 text-4xl">Sticker Album</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Find new stickers as your crew explores and learns together.
        </p>
        <p className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--color-panel-raised)] px-4 font-semibold" aria-live="polite">
          {unlocked}/16 stickers unlocked
        </p>
      </Card>

      <Card>
        <ul className="oc-sticker-grid" aria-label="Sticker collection">
          {stickers.map((sticker, index) => {
            const Icon = stickerIcons[index];
            return (
              <li key={sticker.id}>
                <button
                  type="button"
                  className={`oc-sticker ${sticker.unlocked ? '' : 'oc-sticker--locked'}`}
                  disabled={!sticker.unlocked}
                  aria-label={`${sticker.name}, ${sticker.unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => setSelectedId(sticker.id)}
                >
                  <span className="oc-sticker__art" aria-hidden="true">
                    <Icon size={34} />
                    {!sticker.unlocked && <Lock className="oc-sticker__lock" size={16} />}
                  </span>
                  <span className="oc-sticker__name">{sticker.unlocked ? sticker.name : 'Locked'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex justify-center">
        <BigButton variant="secondary" onClick={() => { window.location.hash = '#/'; }}>
          Back to mission
        </BigButton>
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name || 'Sticker fact'}
      >
        {selected && detail && source && (
          <div className="grid gap-4">
            <p className="text-lg">{detail.fact}</p>
            <a className="oc-source-link" href={source.url} target="_blank" rel="noreferrer">
              Read the source: {source.title}
            </a>
            <BigButton variant="secondary" onClick={() => setSelectedId(null)}>Close</BigButton>
          </div>
        )}
      </Modal>
    </section>
  );
}
