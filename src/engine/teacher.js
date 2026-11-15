function getFirstDrop(series) {
  for (let index = 1; index < series.length; index += 1) {
    for (const [key, name] of [['power', 'Power'], ['life', 'Life Support'], ['shield', 'Shield']]) {
      if (series[index][key] < series[index - 1][key]) {
        return { day: series[index].day, name };
      }
    }
  }
  return null;
}

export function teacherSummary(result = {}) {
  const humanSeries = result.humanSeries || [];
  const ghostSeries = result.ghostSeries || [];
  const dayLabel = (result.site || result.config?.site) === 'mars' ? 'Sol' : 'Day';
  const firstDrop = getFirstDrop(humanSeries);
  const finalHuman = humanSeries[humanSeries.length - 1];
  const finalGhost = ghostSeries.find((item) => item.day === finalHuman?.day);
  const gaugeNames = { power: 'Power', life: 'Life Support', shield: 'Shield' };
  const biggestDifference = finalHuman && finalGhost
    ? ['power', 'life', 'shield']
      .map((gauge) => ({
        gauge,
        difference: Math.abs(finalHuman[gauge] - finalGhost[gauge]),
      }))
      .sort((left, right) => right.difference - left.difference)[0]
    : null;
  const ghostQuestion = biggestDifference?.difference
    ? `The Ghost ended with different ${gaugeNames[biggestDifference.gauge]}. What choices made that happen?`
    : 'What did the Ghost do differently from your crew?';
  const lowestGauge = finalHuman
    ? ['power', 'life', 'shield'].sort((left, right) => finalHuman[left] - finalHuman[right])[0]
    : null;
  const radiationReference = result.radiation?.refs?.find((ref) => ref.id === 'mars-surface');
  const radiationQuestion = typeof result.radiation?.crewDoseMsvPerDay === 'number'
    && radiationReference
    ? `How did your crew's radiation dose compare with Mars surface? What might shielding change?`
    : 'What do the radiation bars teach us about shields and space trips?';
  const tryNext = {
    power: 'Try saving a little more Power next time.',
    life: 'Try giving Life Support a little more power.',
    shield: 'Try building your Shield before a flare.',
  }[lowestGauge] || 'Try a new plan on another world.';

  return {
    questions: [
      firstDrop
        ? `On ${dayLabel} ${firstDrop.day}, ${firstDrop.name} first fell. What choice may have changed it?`
        : 'Which gauge changed first, and what helped your crew?',
      ghostQuestion,
      radiationQuestion,
    ],
    tryNext,
  };
}
