import snapshot from './donki-snapshot.json';

const CACHE_DURATION_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4000;
let cachedResult = null;
let cachedAt = 0;
let pendingRequest = null;

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

function getNewestFlare(entries = []) {
  return entries
    .filter((entry) => entry && (entry.classType || entry.class) && (entry.peakTime || entry.beginTime))
    .sort((left, right) => new Date(right.peakTime || right.beginTime) - new Date(left.peakTime || left.beginTime))[0];
}

function makeSunResult(entry, source, status, fallbackDate = '') {
  const flareClass = entry?.classType || entry?.class || null;
  const peakTime = entry?.peakTime || entry?.beginTime || fallbackDate || null;
  const date = peakTime ? (formatDate(peakTime) || null) : null;
  const text = flareClass && date
    ? `NASA saw a ${flareClass} flare on ${date}!`
    : source === 'live'
      ? 'The Sun has been calm this week.'
      : 'No saved flare update is available right now.';
  return {
    status,
    source,
    flareClass: flareClass || 'No recent flare',
    date,
    text,
  };
}

function getSnapshotFallback() {
  const entry = getNewestFlare(snapshot.flr);
  return makeSunResult(entry, 'snapshot', 'fallback', snapshot.range?.endDate || snapshot.generatedAt);
}

async function requestLatestSun() {
  let timeoutId;
  try {
    if (typeof fetch !== 'function' || typeof AbortController !== 'function') {
      return getSnapshotFallback();
    }

    const now = new Date();
    const endDate = now.toISOString().slice(0, 10);
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const apiKey = import.meta.env?.VITE_NASA_API_KEY || 'DEMO_KEY';
    const url = new URL('https://api.nasa.gov/DONKI/FLR');
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);
    url.searchParams.set('api_key', apiKey);

    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return getSnapshotFallback();
    const entries = await response.json();
    const latest = getNewestFlare(Array.isArray(entries) ? entries : []);
    return makeSunResult(latest, 'live', 'ok');
  } catch {
    return getSnapshotFallback();
  } finally {
    clearTimeout(timeoutId);
  }
}

export function fetchRealSun() {
  if (cachedResult && Date.now() - cachedAt < CACHE_DURATION_MS) {
    return Promise.resolve(cachedResult);
  }
  if (pendingRequest) return pendingRequest;
  pendingRequest = requestLatestSun()
    .then((result) => {
      cachedResult = result;
      cachedAt = Date.now();
      return result;
    })
    .finally(() => { pendingRequest = null; });
  return pendingRequest;
}
