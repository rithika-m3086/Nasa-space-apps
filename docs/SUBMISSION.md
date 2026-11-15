# Submission brief

## Project summary (200 words)

Outpost Command is a browser-based mission-planning game for children ages 7–12. Players act as flight director for a three-person crew spending seven days at Shackleton Crater on the Moon or Jezero Crater on Mars. Each day, players allocate limited energy among life support, radiation shielding, and science, then choose a response to a mission event. Gauges show choice effects; sunlight and dust are game-scaled.

A seeded JavaScript engine keeps missions repeatable. Free, Daily, and Class modes use deterministic mission seeds, while a live NASA DONKI request updates only the Sun banner. A bundled space-weather snapshot provides a fallback; static site facts, event definitions, and NASA image metadata load without a gameplay request. The game also includes a Ghost comparison, rewinds, lessons, a radiation reference panel, mission stickers, a custom patch designer, and a downloadable certificate.

The interface includes keyboard-operable controls, reduced-motion and read-aloud settings, sound controls, and a responsive SVG outpost scene. Vite builds an installable PWA that precaches application assets, fonts, and bundled JSON data. The project includes automated Vitest suites for data, events, store flows, and seeded mission balance. Several science citations and event references remain marked TODO-VERIFY in docs/VERIFY.md; those items are listed below.

## Judging criteria

- **Impact:** The game asks players to make tradeoffs among power, crew life support, shielding, and science. The repository contains no playtest results or measured learning outcomes.
- **Creativity:** Players can compare their choices with a seeded auto-balance Ghost, rewind with limited tokens, and design a mission patch.
- **Validity:** The site data and debrief include source IDs and radiation references. Multiple source URLs and event-science citations remain TODO-VERIFY, so the scientific review is incomplete.
- **Relevance:** The Moon and Mars settings, solar activity, dust, radiation, and crew systems connect the game loop to topics in its included source catalog.
- **Presentation:** The app has an animated SVG outpost, gauge displays, a mission chart, sound/read-aloud preferences, reduced-motion settings, and an installable offline-capable PWA. The play URL is not yet supplied.

## Data-use justification

The game bundles event definitions, site data, NASA image metadata, and a DONKI snapshot so gameplay does not wait for a data request and seeded runs remain repeatable. The only live DONKI request in the app updates the Sun banner; it does not choose events or change mission outcomes. On request failure, that banner uses the bundled snapshot. Current snapshot DONKI entries are placeholders because the recorded FLR/CME requests failed. Image metadata is bundled, but its saved thumbnail host does not pass the EventCard image-host check; the card uses its text fallback.

## TODO-VERIFY

The following items remain open in [docs/VERIFY.md](VERIFY.md):

- Find an authoritative LRO Diviner URL for the lunar south pole temperature fact.
- Find a NASA page for the ISS estimate of about 100 mSv per six months.
- Locate the NTRS Baseline Values and Assumptions Document and verify its intended use.
- Locate authoritative Mars REMS documentation and verify the source metadata.
- Confirm DONKI FLR/CME access with `DEMO_KEY` or `NASA_API_KEY`; the recorded calls returned HTTP 404/400 and saved null-valued placeholders.
- Verify NASA SDO/EVE, SDO/AIA, and MAVEN/SEP source pages for solar-flare and Mars particle events.
- Verify LRO/LROC and LADEE/LDEX source pages for Moon impacts, rover maps, and lunar dust.
- Verify MRO/MARCI and MRO/Electra source pages, including the 4–24 minute Mars message delay.
- Verify Perseverance/MOXIE and ISS Veggie experiment source pages.
- Verify ISS crew health survey and Actiwatch sources for crew rest and well-being facts.
