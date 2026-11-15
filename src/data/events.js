const OPTION_TAGS = ['safe', 'balanced', 'risky'];
const OPTION_EFFECTS = {
  safe: { power: -1, life: 0, shield: 1, science: 0 },
  balanced: { power: 0, life: 0, shield: 0, science: 2 },
  risky: { power: 0, life: -2, shield: -1, science: 4 },
};

function makeScience([headline, mission, instrument, fact, sourceId]) {
  return { headline, mission, instrument, fact, sourceId };
}

function makeEvent(data) {
  const {
    choices, science, image, donkiSlot, shieldScaled = false, optionEffects, ...event
  } = data;
  const result = {
    ...event,
    options: choices.map(([label, hint, capcom], index) => {
      const tag = OPTION_TAGS[index];
      return {
        id: `${event.id}-${tag}`,
        label,
        hint,
        tag,
        effects: { ...(optionEffects?.[tag] || OPTION_EFFECTS[tag]) },
        shieldScaled,
        capcom,
      };
    }),
    science: makeScience(science),
  };
  if (donkiSlot) result.donkiSlot = true;
  if (image) result.image = { nasaId: image };
  return result;
}

export const events = [
  makeEvent({
    id: 'moon-m-flare', sites: ['moon'], kind: 'flare', title: 'M-Class Solar Flare',
    kid: 'A medium solar flare sends bright light toward the Moon.',
    why: 'A flare can send fast energy from the Sun.',
    science: ['Solar activity', 'Solar Dynamics Observatory', 'EVE', "EVE measures changes in the Sun's light.", 'TODO-VERIFY'],
    choices: [
      ['Raise the shield', 'Use one power unit.', 'Good call! The shield is ready.'],
      ['Wait in the safe room', 'Protect the crew and learn.', 'Nice teamwork. We stayed safe.'],
      ['Watch the bright flash', 'More science, with a small risk.', 'That was bold. Let us plan next time.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
    shieldScaled: true, donkiSlot: true, image: 'PIA21958',
  }),
  makeEvent({
    id: 'moon-x-flare', sites: ['moon'], kind: 'flare', title: 'X-Class Solar Flare',
    kid: 'A big solar flare sends more tiny bits our way.',
    why: 'Big flares can bring more energy from the Sun.',
    science: ['Solar activity', 'Solar Dynamics Observatory', 'AIA', 'AIA takes pictures of the Sun.', 'TODO-VERIFY'],
    choices: [
      ['Move to the safe room', 'Use one power unit.', 'Good plan. The crew is safe.'],
      ['Turn on the shield', 'Keep the crew and gear ready.', 'Great teamwork. The shield is set.'],
      ['Keep working outside', 'Gain science with a small risk.', 'You learned from a bold choice.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
    shieldScaled: true, donkiSlot: true, image: 'PIA21949',
  }),
  makeEvent({
    id: 'moon-micrometeorites', sites: ['moon'], kind: 'micrometeorite', title: 'Micrometeorite Shower',
    kid: 'Tiny space rocks tap the Moon base shield.',
    why: 'Small rocks can bump into spacecraft.',
    science: ['Moon impacts', 'Lunar Reconnaissance Orbiter', 'LROC', 'LROC takes detailed pictures of the Moon.', 'TODO-VERIFY'],
    choices: [
      ['Cover the dome', 'Use one power unit.', 'Nice work. The dome is covered.'],
      ['Check the tiny marks', 'Learn what touched the shield.', 'Good check. We found a clue.'],
      ['Keep working outside', 'Gain science with a small risk.', 'You stayed curious and learned.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
    shieldScaled: true,
  }),
  makeEvent({
    id: 'moon-long-shadow', sites: ['moon'], kind: 'equipment', title: 'Long Shadow',
    kid: 'A long shadow gives our panels less light.',
    why: 'Shadows can block sunlight from the panels.',
    science: ['Moon light and heat', 'Lunar Reconnaissance Orbiter', 'Diviner Radiometer', 'Diviner maps heat across the Moon.', 'lro-diviner'],
    choices: [
      ['Save power', 'Use one power unit.', 'Smart planning. Power is saved.'],
      ['Turn the panels', 'Keep the plan steady.', 'Great teamwork. The panels are set.'],
      ['Run every tool', 'Gain science with a small risk.', 'We learned what needs more power.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
    image: 'PIA13523',
  }),
  makeEvent({
    id: 'moon-sticky-dust', sites: ['moon'], kind: 'dust', title: 'Sticky Dust',
    kid: 'Moon dust sticks to the panel cover.',
    why: 'Dust can make it harder to gather sunlight.',
    science: ['Moon dust', 'LADEE', 'Lunar Dust Experiment (LDEX)', 'LDEX studied tiny dust near the Moon.', 'TODO-VERIFY'],
    choices: [
      ['Brush the panels', 'Use one power unit.', 'Nice fix. The panels are clearer.'],
      ['Use a dust cover', 'Protect the panels for later.', 'Good thinking. The panels are covered.'],
      ['Leave dust in place', 'Gain science with a small risk.', 'We saw how dust can change power.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
  }),
  makeEvent({
    id: 'moon-ice-discovery', sites: ['moon'], kind: 'discovery', title: 'Ice Discovery',
    kid: 'The crew spots water ice in a dark crater.',
    why: 'The crew can study a small ice sample.',
    science: ['Moon water', 'LCROSS', 'Near-infrared spectrometer', 'LCROSS found water in a crater plume.', 'lcross'],
    choices: [
      ['Scan the ice', 'Use one power unit.', 'Great scan. We found a clue.'],
      ['Save a small sample', 'Balance care and learning.', 'Nice work. The sample is safe.'],
      ['Dig a little deeper', 'Gain science with a small risk.', 'Curiosity helped us learn more.'],
    ],
  }),
  makeEvent({
    id: 'moon-airlock-leak', sites: ['moon'], kind: 'equipment', title: 'Airlock Leak',
    kid: 'Air leaks from a small seal near the door.',
    why: 'A good seal helps keep air inside.',
    science: ['Crew life support', 'International Space Station', 'ECLSS', 'ECLSS helps clean air and water.', 'eclss-bvad'],
    choices: [
      ['Patch the seal', 'Use one power unit.', 'Good fix. The seal is in place.'],
      ['Check it twice', 'Keep the crew safe and learn.', 'Careful work helps the whole crew.'],
      ['Leave it for later', 'Gain science with a small risk.', 'We learned to check seals sooner.'],
    ],
  }),
  makeEvent({
    id: 'moon-rover-trip', sites: ['moon'], kind: 'discovery', title: 'Rover Trip',
    kid: 'The rover bumps a rock on its trail.',
    why: 'A slow check can help the rover keep going.',
    science: ['Moon maps', 'Lunar Reconnaissance Orbiter', 'LROC', 'LROC maps paths across the Moon.', 'TODO-VERIFY'],
    choices: [
      ['Stop and check', 'Use one power unit.', 'Good check. The rover is ready.'],
      ['Mark the rock', 'Keep the plan steady.', 'Nice note. The next trip is easier.'],
      ['Drive over the ridge', 'Gain science with a small risk.', 'You found a new path to study.'],
    ],
    image: 'PIA13523',
  }),
  makeEvent({
    id: 'mars-dust-devil', sites: ['mars'], kind: 'dust', title: 'Dust Devil',
    kid: 'A dust devil swirls near the rover.',
    why: 'Wind can move dust across the ground.',
    science: ['Mars weather', 'Curiosity rover', 'REMS wind sensor', 'REMS measures wind and air on Mars.', 'mars-rems'],
    choices: [
      ['Park the rover', 'Use one power unit.', 'Good plan. The rover is safe.'],
      ['Wait for dust', 'Keep the plan steady.', 'Nice wait. The dust is moving on.'],
      ['Drive through', 'Gain science with a small risk.', 'You learned how the dust moves.'],
    ],
    optionEffects: { balanced: { power: 0, life: 1, shield: 4, science: 2 } },
    image: 'PIA22519',
  }),
  makeEvent({
    id: 'mars-global-dust-storm', sites: ['mars'], kind: 'dust', title: 'Global Dust Storm',
    kid: 'A wide dust storm covers much of Mars.',
    why: 'Dust in the air can block sunlight.',
    science: ['Mars weather', 'Mars Reconnaissance Orbiter', 'MARCI', 'MARCI watches clouds and dust on Mars.', 'TODO-VERIFY'],
    choices: [
      ['Save panel power', 'Use one power unit.', 'Smart plan. Power is saved.'],
      ['Cover the panels', 'Keep gear safe from dust.', 'Good teamwork. The panels are covered.'],
      ['Work outside', 'Gain science with a small risk.', 'We saw how dust can change the sky.'],
    ],
    optionEffects: { balanced: { power: 0, life: 1, shield: 4, science: 2 } },
    image: 'PIA22519',
  }),
  makeEvent({
    id: 'mars-cme-arrives', sites: ['mars'], kind: 'flare', title: 'Solar Burst Reaches Mars',
    kid: 'A wave from the Sun reaches Mars.',
    why: 'The Sun can send tiny particles through space.',
    science: ['Mars space weather', 'MAVEN', 'Solar Energetic Particle instrument', 'MAVEN studies particles near Mars.', 'TODO-VERIFY'],
    choices: [
      ['Use the safe room', 'Use one power unit.', 'Good call. The crew is ready.'],
      ['Turn on the shield', 'Protect the crew and learn.', 'Nice teamwork. The shield is set.'],
      ['Watch the bright burst', 'Gain science with a small risk.', 'You watched closely and learned.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
    shieldScaled: true, donkiSlot: true, image: 'PIA21958',
  }),
  makeEvent({
    id: 'mars-cold-night', sites: ['mars'], kind: 'equipment', title: 'Cold Night',
    kid: 'A cold night chills the outpost walls.',
    why: 'Warm gear helps the crew work well.',
    science: ['Mars weather', 'Curiosity rover', 'REMS ground temperature sensor', 'REMS measures air and ground temperature.', 'mars-rems'],
    choices: [
      ['Warm the room', 'Use one power unit.', 'Cozy plan. The room is warming.'],
      ['Share the heat pack', 'Keep the crew warm and ready.', 'Nice teamwork. Everyone is warmer.'],
      ['Use less power', 'Gain science with a small risk.', 'We learned how the night feels.'],
    ],
    optionEffects: { balanced: { power: 0, life: 0, shield: -11, science: 2 } },
    image: 'PIA24172',
  }),
  makeEvent({
    id: 'mars-comms-delay', sites: ['mars'], kind: 'comms', title: 'Comms Delay',
    kid: 'A message takes time to cross space.',
    why: 'Mars messages can take minutes to reach Earth.',
    science: ['Mars communication', 'Mars Reconnaissance Orbiter', 'Electra UHF relay', 'Messages can take 4 to 24 minutes one way.', 'TODO-VERIFY'],
    choices: [
      ['Send a short note', 'Use one power unit.', 'Good note. The message is on its way.'],
      ['Wait for a reply', 'Keep the plan steady.', 'Nice wait. We will hear back soon.'],
      ['Send the full file', 'Gain science with a small risk.', 'We learned to plan for the delay.'],
    ],
  }),
  makeEvent({
    id: 'mars-oxygen-experiment', sites: ['mars'], kind: 'discovery', title: 'Oxygen From Air',
    kid: 'The rover tests a way to make oxygen.',
    why: 'A small test helps us learn about Mars air.',
    science: ['Mars oxygen test', 'Perseverance rover', 'MOXIE', 'MOXIE tested making oxygen from Mars air.', 'TODO-VERIFY'],
    choices: [
      ['Run a small test', 'Use one power unit.', 'Great test. We learned a little more.'],
      ['Save the gas', 'Keep the plan steady.', 'Good thinking. Every bit can help.'],
      ['Try a longer test', 'Gain science with a small risk.', 'Your bold test found new clues.'],
    ],
    image: 'PIA24172',
  }),
  makeEvent({
    id: 'mars-homesick', sites: ['mars'], kind: 'crew', title: 'Missing Home',
    kid: 'A crew mate misses home and family.',
    why: 'Kind words can help a crew mate feel close.',
    science: ['Crew well-being', 'International Space Station', 'Crew health surveys', 'NASA studies how crews work together in space.', 'TODO-VERIFY'],
    choices: [
      ['Send a kind note', 'Use one power unit.', 'That was kind. Your crew is here.'],
      ['Share a story', 'Help the crew feel close.', 'Good story. We are here together.'],
      ['Work through it', 'Gain science with a small risk.', 'You kept learning as a team.'],
    ],
  }),
  makeEvent({
    id: 'mars-hydroponics-bloom', sites: ['mars'], kind: 'discovery', title: 'Garden Bloom',
    kid: 'New leaves grow in the space garden.',
    why: 'Plants need care, water, and light.',
    science: ['Space plants', 'International Space Station', 'Veggie plant growth system', 'Veggie helps crews grow plants in space.', 'TODO-VERIFY'],
    choices: [
      ['Check each leaf', 'Use one power unit.', 'Great care. The leaves look bright.'],
      ['Share the water', 'Keep the garden plan steady.', 'Nice teamwork. The plants are growing.'],
      ['Add more light', 'Gain science with a small risk.', 'Your test helped the garden teach us.'],
    ],
    image: 'PIA24172',
  }),
  makeEvent({
    id: 'shared-tired-crew', sites: ['moon', 'mars'], kind: 'crew', title: 'Tired Crew',
    kid: 'The crew feels tired after a busy day.',
    why: 'Rest helps people feel ready for work.',
    science: ['Crew rest', 'International Space Station', 'Actiwatch sleep monitor', 'Actiwatch records sleep and rest patterns.', 'TODO-VERIFY'],
    choices: [
      ['Take a short rest', 'Use one power unit.', 'Good choice. Rest can help a lot.'],
      ['Share the jobs', 'Keep the crew plan steady.', 'Nice teamwork. Everyone has a part.'],
      ['Skip the break', 'Gain science with a small risk.', 'We learned that rest matters.'],
    ],
  }),
  makeEvent({
    id: 'shared-birthday-surprise', sites: ['moon', 'mars'], kind: 'crew', title: 'Birthday Surprise',
    kid: "Today is a crew mate's birthday!",
    why: 'A kind surprise can bring the crew together.',
    science: ['Space garden', 'International Space Station', 'Veggie plant growth system', 'Plant studies help crews learn about food in space.', 'TODO-VERIFY'],
    choices: [
      ['Plan a small treat', 'Use one power unit.', 'What a kind surprise. Happy birthday!'],
      ['Share a birthday song', 'Keep the crew close.', 'That was lovely. The crew smiled.'],
      ['Use extra power', 'Gain science with a small risk.', 'We made a bright day together.'],
    ],
  }),
];
