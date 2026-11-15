export function parseShareCode(value) {
  const match = value.trim().toUpperCase().match(/^AP-([MR])-([A-Z0-9]{1,6})$/);
  if (!match) return null;
  return {
    site: match[1] === 'M' ? 'Moon' : 'Mars',
    missionKey: match[2],
  };
}
