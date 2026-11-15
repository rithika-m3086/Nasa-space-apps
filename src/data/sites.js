export const sites = {
  moon: {
    name: 'Shackleton Crater rim, lunar south pole',
    dayLabel: 'Day',
    tagline: 'Plan a Moon mission together.',
    facts: [
      {
        kid: "Some dark craters near the Moon's south pole stay below -170°C.",
        real: true,
        sourceId: 'lro-diviner',
      },
      {
        kid: "One spot on Shackleton's rim gets sunlight about 89% of the time.",
        real: true,
        sourceId: 'mazarico-2011',
      },
      {
        kid: "LCROSS found water ice equal to about 5.6% of the Cabeus plume's mass.",
        real: true,
        sourceId: 'lcross',
      },
    ],
    gameScaled: {
      sun: [0.9, 0.8, 0.9, 0.6, 0.8, 0.9, 0.7],
      dust: [0, 0, 0, 0, 0, 0, 0],
      gameEstimate: true,
    },
  },
  mars: {
    name: 'Jezero Crater',
    dayLabel: 'Sol',
    tagline: 'Explore Jezero and help your crew learn.',
    facts: [
      {
        kid: 'Curiosity measured about 1.8 mSv each day during its trip to Mars.',
        real: true,
        sourceId: 'rad-surface',
      },
      {
        kid: 'Curiosity measured about 0.67 mSv each day on Mars.',
        real: true,
        sourceId: 'rad-surface',
      },
      {
        kid: 'An ISS chart reports about 100 mSv across six months.',
        real: true,
        sourceId: 'iss-dose',
      },
    ],
    gameScaled: {
      sun: [0.9, 0.9, 0.8, 0.7, 0.5, 0.6, 0.8],
      dust: [0, 0.1, 0.1, 0.3, 0.7, 0.5, 0.2],
      gameEstimate: true,
    },
  },
};
