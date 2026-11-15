const optionText = [
  {
    id: 'safe',
    label: 'Choose the careful plan',
    hint: 'Use a little energy.',
    tag: 'safe',
    capcom: 'A thoughtful choice. The crew is ready.',
  },
  {
    id: 'balanced',
    label: 'Share the resources',
    hint: 'Balance safety and science.',
    tag: 'balanced',
    capcom: 'Nice teamwork. We can keep going.',
  },
  {
    id: 'risky',
    label: 'Try the bold plan',
    hint: 'There may be a trade-off.',
    tag: 'risky',
    capcom: 'You learned something new. Let us plan the next step.',
  },
];

function makeEvent({ id, sites, kind, title, kid, why, effects, shieldScaled = false }) {
  return {
    id,
    sites,
    kind,
    title,
    kid,
    why,
    options: optionText.map((option, index) => ({
      ...option,
      id: `${id}-${option.id}`,
      effects: effects[index],
      shieldScaled,
    })),
    science: {
      headline: 'Mission science',
      mission: 'OUTPOST COMMAND',
      instrument: 'Game estimate',
      fact: 'The crew can learn by watching what changes.',
      sourceId: 'donki',
    },
  };
}

export const placeholderEvents = [
  makeEvent({
    id: 'flare',
    sites: ['moon', 'mars'],
    kind: 'flare',
    title: 'Solar Flare Alert!',
    kid: 'The Sun sent a big burst of tiny particles!',
    why: 'Flares send fast particles. Shields slow them down.',
    shieldScaled: true,
    effects: [
      { power: -2, life: 0, shield: 0, science: 0 },
      { power: 0, life: 0, shield: -9, science: 2 },
      { power: 0, life: -4, shield: -2, science: 4 },
    ],
  }),
  makeEvent({
    id: 'dust',
    sites: ['mars'],
    kind: 'dust',
    title: 'Dusty Day',
    kid: 'Dust is covering the solar panels.',
    why: 'Dust can block sunlight from reaching the panels.',
    effects: [
      { power: -2, life: 0, shield: 0, science: 0 },
      { power: 0, life: 4, shield: 12, science: 2 },
      { power: 1, life: -3, shield: -1, science: 4 },
    ],
  }),
  makeEvent({
    id: 'micrometeorite',
    sites: ['moon', 'mars'],
    kind: 'micrometeorite',
    title: 'Tiny Space Rock',
    kid: 'A tiny space rock tapped the outpost.',
    why: 'Small rocks can bump into spacecraft.',
    effects: [
      { power: -1, life: 0, shield: 0, science: 0 },
      { power: 0, life: 0, shield: -9, science: 2 },
      { power: 0, life: -3, shield: -3, science: 4 },
    ],
  }),
  makeEvent({
    id: 'equipment',
    sites: ['moon', 'mars'],
    kind: 'equipment',
    title: 'A Tool Needs Care',
    kid: 'One science tool needs a quick repair.',
    why: 'Caring for equipment helps it work again.',
    effects: [
      { power: -3, life: 0, shield: 0, science: 0 },
      { power: -1, life: 0, shield: -9, science: 2 },
      { power: 1, life: -2, shield: 0, science: 4 },
    ],
  }),
  makeEvent({
    id: 'crew',
    sites: ['moon', 'mars'],
    kind: 'crew',
    title: 'Crew Check-In',
    kid: 'A crew member asks for a little extra rest.',
    why: 'Rest helps people stay ready for their work.',
    effects: [
      { power: -1, life: 0, shield: 0, science: 0 },
      { power: 0, life: 0, shield: 0, science: 2 },
      { power: 0, life: -2, shield: 0, science: 4 },
    ],
  }),
  makeEvent({
    id: 'discovery',
    sites: ['moon', 'mars'],
    kind: 'discovery',
    title: 'A New Clue',
    kid: 'The crew spotted an interesting mark nearby.',
    why: 'Careful observations can lead to new questions.',
    effects: [
      { power: -1, life: 0, shield: 0, science: 2 },
      { power: 0, life: 0, shield: 0, science: 4 },
      { power: 1, life: -1, shield: 0, science: 6 },
    ],
  }),
];
