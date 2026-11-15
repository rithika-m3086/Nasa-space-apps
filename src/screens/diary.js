export const diaryTemplates = [
  { trait: 'Brave', mood: 'happy', text: 'I helped our crew feel brave today.' },
  { trait: 'Brave', mood: 'ok', text: 'I took one careful step with my crew.' },
  { trait: 'Brave', mood: 'worried', text: 'I asked for help, and we made a new plan.' },
  { trait: 'Curious', mood: 'happy', text: 'I found a new clue for science.' },
  { trait: 'Curious', mood: 'ok', text: 'I watched our tools and learned something new.' },
  { trait: 'Curious', mood: 'worried', text: 'I slowed down and looked at the problem again.' },
  { trait: 'Funny', mood: 'happy', text: 'I made my crew smile during our busy day.' },
  { trait: 'Funny', mood: 'ok', text: 'A small joke made the work feel lighter.' },
  { trait: 'Funny', mood: 'worried', text: 'We took a breath and tried a kind idea.' },
  { trait: 'Careful', mood: 'happy', text: 'I checked our plan before we started.' },
  { trait: 'Careful', mood: 'ok', text: 'I saved some power for later.' },
  { trait: 'Careful', mood: 'worried', text: 'I checked the shield and asked my crew to help.' },
];

export function selectDiaryEntry(crew, day) {
  const member = crew[(Math.max(1, day) - 1) % Math.max(crew.length, 1)];
  const matches = diaryTemplates.filter((entry) => entry.trait === member?.trait && entry.mood === member?.mood);
  const fallback = diaryTemplates.filter((entry) => entry.mood === member?.mood);
  const choices = matches.length ? matches : fallback.length ? fallback : diaryTemplates;
  return {
    name: member?.name || 'A crew member',
    text: choices[(Math.max(1, day) - 1) % choices.length].text,
  };
}
