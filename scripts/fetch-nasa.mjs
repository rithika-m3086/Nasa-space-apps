import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../src/data/', import.meta.url));
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const IMAGE_QUERIES = [
  'lunar south pole',
  'Shackleton crater',
  'Jezero crater',
  'solar flare',
  'Mars dust storm',
  'International Space Station plants',
  'spacesuit',
  'Artemis',
];
const REQUEST_TIMEOUT_MS = 15_000;

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchJson(url, label) {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
  return response.json();
}

function donkiRecords(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    class: item.classType || item.cmeAnalyses?.[0]?.type || null,
    peakTime: item.peakTime || item.startTime || null,
    id: item.flrID || item.activityID || null,
    link: item.link || null,
  }));
}

function imageRecords(payload, query) {
  const items = payload?.collection?.items;
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    const data = item.data?.[0];
    if (!data) return [];
    if (/\b(?:logo|insignia)\b/i.test(data.title || '')) return [];
    return [{
      query,
      title: data.title || null,
      nasa_id: data.nasa_id || null,
      center: data.center || null,
      date_created: data.date_created || null,
      thumbnail_href: item.links?.find((link) => link.rel === 'preview')?.href || null,
      details_link: item.href || null,
    }];
  });
}

async function collect(label, url, transform, errors) {
  try {
    return transform(await fetchJson(url, label));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[data:fetch] ${label}: ${message}`);
    errors.push({ source: label, message });
    return [];
  }
}

async function writeSnapshot(name, snapshot) {
  const destination = path.join(DATA_DIR, name);
  await writeFile(destination, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
}

async function main() {
  const generatedAt = new Date().toISOString();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
  const range = { startDate: dateOnly(startDate), endDate: dateOnly(endDate) };
  const errors = [];
  const apiParams = new URLSearchParams({
    startDate: range.startDate,
    endDate: range.endDate,
    api_key: NASA_API_KEY,
  });
  const donkiUrl = (eventType) => (
    `https://api.nasa.gov/DONKI/${eventType}?${apiParams.toString()}`
  );
  const imageSearch = (query) => {
    const params = new URLSearchParams({ q: query, media_type: 'image', page_size: '5' });
    return `https://images-api.nasa.gov/search?${params.toString()}`;
  };

  await mkdir(DATA_DIR, { recursive: true });
  const [flr, cme, ...imageResults] = await Promise.all([
    collect('DONKI FLR', donkiUrl('FLR'), donkiRecords, errors),
    collect('DONKI CME', donkiUrl('CME'), donkiRecords, errors),
    ...IMAGE_QUERIES.map((query) => collect(
      `NASA Images "${query}"`,
      imageSearch(query),
      (payload) => imageRecords(payload, query),
      errors,
    )),
  ]);
  const imageItems = imageResults.flat();

  await writeSnapshot('donki-snapshot.json', {
    generatedAt,
    range,
    flr,
    cme,
    errors: errors.filter((error) => error.source.startsWith('DONKI')),
  });
  await writeSnapshot('nasa-images.json', {
    generatedAt,
    queries: IMAGE_QUERIES,
    items: imageItems,
    errors: errors.filter((error) => error.source.startsWith('NASA Images')),
  });
  console.log(
    `[data:fetch] Saved ${flr.length} FLR, ${cme.length} CME, and ${imageItems.length} image records.`,
  );
  if (errors.length) {
    console.error(`[data:fetch] ${errors.length} request(s) failed; snapshots include empty fallback arrays.`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[data:fetch] Could not write snapshots: ${message}`);
});
