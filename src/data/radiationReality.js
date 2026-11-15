export const refs = [
  {
    id: 'mars-cruise',
    label: 'Mars cruise',
    msvPerDay: 1.8,
    note: 'Curiosity RAD cruise measurement.',
    sourceId: 'rad-surface',
  },
  {
    id: 'mars-surface',
    label: 'Mars surface',
    msvPerDay: 0.67,
    note: 'Curiosity RAD surface measurement.',
    sourceId: 'rad-surface',
  },
  {
    id: 'iss',
    label: 'International Space Station',
    msvPerDay: 0.55,
    note: 'Approximate daily average from 100 mSv per six months.',
    sourceId: 'iss-dose',
  },
];

export const kidEquivalents = [
  {
    refId: 'mars-cruise',
    kid: 'A Mars trip can mean one whole-body CT scan every five or six days.',
    sourceId: 'rad-cruise',
  },
];

export const radiationReality = {
  crewDoseMsvPerDay: 0.67,
  refs,
  kidEquivalents,
};
