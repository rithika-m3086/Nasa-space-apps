# Outpost Command

Outpost Command is a seven-day Moon and Mars mission-planning game for junior flight directors ages 7–12.

**Play:** TODO — add the deployed game URL.

## Features

- Plan for a three-person crew at the Shackleton Crater rim or Jezero Crater.
- Balance power, life support, radiation shielding, and science through daily allocations and mission events.
- Play Free, Daily, or Class missions with seeded, repeatable gameplay.
- Review outcomes against the auto-balancing Ghost, rewind when tokens remain, and read mission lessons.
- View science notes and radiation references; create a mission patch and download a certificate.
- Use keyboard-operable controls, sound and read-aloud preferences, and reduced-motion settings.
- Explore an animated SVG outpost scene and install the app as a PWA.
- The Sticker Album and Teacher routes are placeholders; the album is not a finished screen.

## Data

Site facts, event definitions, and NASA image metadata are bundled with the app. Static mission data avoids gameplay network waits and keeps seeded runs repeatable. `donki-snapshot.json` also ships as the live-banner fallback. The live DONKI request is used only for the Sun banner; its response does not affect mission gameplay. NASA image snapshots contain metadata and remote URLs, not downloaded image files. Several source records remain marked `TODO-VERIFY`; see [docs/VERIFY.md](docs/VERIFY.md).

## Architecture

1. Vite builds and serves the React 18 single-page application.
2. `src/App.jsx` routes hash pages and mission-flow screens.
3. `src/store/useMission.js` exposes the Zustand mission state and actions.
4. `src/engine/` holds seeded mission rules, outcomes, rewind, and Ghost replay.
5. `src/data/` contains sites, events, science sources, fixtures, and JSON snapshots.
6. `src/data/liveSun.js` fetches DONKI for the banner and falls back to the bundled snapshot.
7. `src/screens/` contains mission flow, debrief, certificate, and patch screens.
8. `src/components/` contains the HUD, outpost scene, settings, and feedback components.
9. `vite.config.js` configures the installable PWA and emits source JSON into the build.
10. `tests/` uses Vitest for engine, data, store, balance, and smoke checks.

## Run, test, and build

```sh
npm install
npm run dev
npm test
npm run build
```

For the documented offline check, run `npm run check:offline`, then `npm run preview`. Enable **Network > Offline** in browser DevTools and reload after the service worker has installed.

## Deploy

**Vercel:** Import the repository, select the Vite framework preset, and set `VITE_NASA_API_KEY` in the project environment variables.

**Netlify:** Run `npm run build` and deploy the generated `dist/` folder.

## License

This project is distributed under the Apache License 2.0; see [LICENSE](LICENSE).
