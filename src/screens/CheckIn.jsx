import React from 'react';
import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { createRng, getDailySeed } from '../engine/index.js';
import AstronautAvatar from '../components/AstronautAvatar.jsx';
import { BigButton, Card } from '../components/ui/index.js';
import { sites } from '../data/sites.js';
import { sources } from '../data/sources.js';

const avatars = [
  { id: 'cyan', color: '#22D3EE' },
  { id: 'pink', color: '#FF5FA2' },
  { id: 'gold', color: '#FFD23F' },
  { id: 'violet', color: '#8B5CF6' },
  { id: 'lime', color: '#7CFF6B' },
  { id: 'blue', color: '#5895FF' },
  { id: 'orange', color: '#FF9B54' },
  { id: 'rose', color: '#FF7BB5' },
];
const adjectives = ['Bright', 'Brave', 'Curious', 'Kind', 'Swift', 'Sunny', 'Clever', 'Calm'];
const animals = ['Comet', 'Otter', 'Panda', 'Fox', 'Dolphin', 'Koala', 'Robin', 'Tiger'];

function FactLine({ fact }) {
  const source = sources.find((item) => item.id === fact.sourceId);
  return (
    <li className="text-sm leading-relaxed">
      {fact.kid}{' '}
      {source?.url.startsWith('http') && (
        <a className="inline-flex min-h-11 items-center text-[var(--color-power)] underline" href={source.url} target="_blank" rel="noreferrer">
          Source
        </a>
      )}
    </li>
  );
}

export default function CheckIn({ onStart, onBack }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('cyan');
  const [site, setSite] = useState('moon');
  const [difficulty, setDifficulty] = useState('cadet');
  const [surpriseCount, setSurpriseCount] = useState(0);
  const nameValue = name.trim() || 'Cadet Nova';

  const surpriseName = () => {
    const rng = createRng(`${getDailySeed()}|surprise|${surpriseCount}`);
    setName(`${rng.pick(adjectives)} ${rng.pick(animals)}`);
    setSurpriseCount((count) => count + 1);
  };
  const start = (overrides = {}) => onStart({
    cadetName: nameValue,
    avatar,
    site,
    difficulty,
    mode: 'free',
    seed: `${getDailySeed()}-${nameValue}`,
    ...overrides,
  });

  return (
    <div className="grid gap-5">
      <Card>
        <BigButton variant="ghost" className="mb-3" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={20} /> Back
        </BigButton>
        <p className="font-semibold text-[var(--color-power)]">CREW CHECK-IN</p>
        <h1 className="oc-display mt-1 text-4xl">Who is leading today?</h1>
        <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-2 font-semibold" htmlFor="callsign">Your callsign</label>
          <span />
          <input
            id="callsign"
            className="min-h-12 rounded-xl border border-white/20 bg-[var(--color-panel-raised)] px-3"
            value={name}
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cadet Nova"
          />
          <BigButton variant="secondary" onClick={surpriseName}>
            <Sparkles aria-hidden="true" size={18} /> Surprise me
          </BigButton>
        </div>
        <fieldset className="mt-6">
          <legend className="mb-3 font-semibold">Pick your astronaut</legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {avatars.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`min-h-16 rounded-2xl border p-2 ${avatar === item.id ? 'border-[var(--color-science)] bg-white/10' : 'border-white/10 bg-[var(--color-panel-raised)]'}`}
                aria-label={`Choose astronaut ${index + 1}`}
                aria-pressed={avatar === item.id}
                onClick={() => setAvatar(item.id)}
              >
                <AstronautAvatar color={item.color} />
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Choose a landing site">
        {Object.entries(sites).map(([key, info]) => (
          <Card
            key={key}
            className={`border-2 ${site === key ? 'border-[var(--color-accent)]' : 'border-transparent'}`}
          >
            <button
              className="min-h-12 w-full text-left"
              type="button"
              aria-pressed={site === key}
              onClick={() => setSite(key)}
            >
              <span className="oc-display text-2xl">{key === 'moon' ? 'Moon' : 'Mars'}</span>
              <span className="ml-2 text-sm text-[var(--color-muted)]">{info.name}</span>
            </button>
            <ul className="mt-3 grid gap-1">
              {info.facts.slice(0, 2).map((fact) => <FactLine key={fact.sourceId + fact.kid} fact={fact} />)}
            </ul>
            <span className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[var(--color-shield)]/15 px-3 text-sm text-[var(--color-shield)]">
              Game estimate: sun and dust
            </span>
          </Card>
        ))}
      </section>

      <Card>
        <fieldset>
          <legend className="oc-display text-2xl">Choose a mission level</legend>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Cadet has 2 rewinds. Commander has 1 rewind and a tougher plan.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {['cadet', 'commander'].map((level) => (
              <BigButton
                key={level}
                variant={difficulty === level ? 'primary' : 'secondary'}
                aria-pressed={difficulty === level}
                onClick={() => setDifficulty(level)}
              >
                {level === 'cadet' ? 'Cadet' : 'Commander'}
              </BigButton>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap gap-3">
          <BigButton onClick={() => start()}>Start mission</BigButton>
          <BigButton
            variant="secondary"
            onClick={() => start({
              cadetName: 'Cadet Nova',
              avatar: 'cyan',
              site: 'moon',
              difficulty: 'cadet',
              seed: `${getDailySeed()}-Cadet Nova`,
            })}
          >
            Quick Demo
          </BigButton>
        </div>
      </Card>
    </div>
  );
}
