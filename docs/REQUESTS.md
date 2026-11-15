## 2026-11-15 — Post-rebase UI handoff

Rithika's changes visible in the last ten commits:
- `79810ed`: scaffolded `src/store/useMission.js`, `src/engine/index.js`, and initial `src/data/fixtures.js` and `src/data/sources.js`.
- `6cc8595`: added `src/engine/{autoBalance,balance,crew,state,step}.js` and `src/data/events.placeholder.js`; replaced the store internals and expanded engine exports.
- `358ee3d`: added `src/data/{donki-snapshot,nasa-images,radiationReality,sites}.js/json`, expanded sources, and updated fixtures.

Contract/component check:
1. No contract field, action, selector, or event-shape mismatch found; existing HUD components remain compatible.
2. `useMission` starts with `status: 'running'` despite `missionsPlayed: 0`; App must show Title for a new profile without changing the store.
3. `fetchRealSun()` currently selects the saved snapshot fallback, so the banner must not claim live data.