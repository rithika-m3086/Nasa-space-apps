import { BALANCE } from './balance.js';
import { createRng } from './rng.js';

const CREW_NAMES = ['Maya', 'Leo', 'Ari'];
const CREW_TRAITS = ['Brave', 'Curious', 'Funny', 'Careful'];
const CREW_GAUGES = ['life', 'shield', 'power'];

function moodForGauge(value) {
  if (value < BALANCE.crewWorriedThreshold) return 'worried';
  if (value < BALANCE.crewHappyThreshold) return 'ok';
  return 'happy';
}

export function updateCrewMood(crew, gauges) {
  return crew.map((member, index) => ({
    ...member,
    mood: moodForGauge(gauges[CREW_GAUGES[index % CREW_GAUGES.length]]),
  }));
}

export function createCrew(seed, gauges) {
  const rng = createRng(`${seed}:crew`);
  return updateCrewMood(
    CREW_NAMES.map((name, index) => ({
      id: `crew-${index + 1}`,
      name,
      trait: rng.pick(CREW_TRAITS),
      mood: 'ok',
    })),
    gauges,
  );
}

export function selectAllocationTip(state) {
  const [weakest] = Object.entries(state.gauges).sort((left, right) => left[1] - right[1]);
  const tips = {
    power: 'Saving energy gives your crew more choices.',
    life: 'More life support helps your crew feel strong.',
    shield: 'A stronger shield helps protect your crew.',
  };
  return tips[weakest[0]];
}
