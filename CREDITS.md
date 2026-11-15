# Credits

## Science and data sources

These are the entries currently recorded in `src/data/sources.js`. A `TODO-VERIFY` URL is intentionally unresolved.

| Source ID | Title / organization | URL |
|---|---|---|
| `donki` | DONKI API — NASA | https://api.nasa.gov |
| `nasa-images` | NASA Image and Video Library API — NASA | https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf |
| `rad-cruise` | Mars radiation exposure study — Southwest Research Institute | https://www.swri.org/press-release/swri-led-team-calculates-radiation-exposure-associated-trip-mars |
| `lro-diviner` | Lunar Reconnaissance Orbiter Diviner measurements — NASA | TODO-VERIFY |
| `mazarico-2011` | Mazarico et al. (2011), lunar polar illumination — Icarus | https://doi.org/10.1016/j.icarus.2010.10.030 |
| `lcross` | Moon Water and Ices — NASA | https://science.nasa.gov/moon/moon-water-and-ices/ |
| `rad-surface` | Hassler et al. (2013), Curiosity RAD measurements — Science | https://doi.org/10.1126/science.1244797 |
| `iss-dose` | International Space Station radiation dose estimate — NASA / Southwest Research Institute | TODO-VERIFY |
| `eclss-bvad` | NTRS Baseline Values and Assumptions Document — NASA | TODO-VERIFY |
| `mars-rems` | Mars REMS instrument documentation — NASA | TODO-VERIFY |

The detailed use notes for each source are in `src/data/sources.js`. Unverified science and instrument citations are tracked in [docs/VERIFY.md](docs/VERIFY.md).

## NASA media note

`src/data/nasa-images.json` stores NASA Images API metadata and remote URLs, not downloaded NASA image files. The generated app icon is original project artwork. No NASA logo or insignia is included. Before enabling or redistributing any NASA media, verify the individual item's credit and usage information. The current snapshot's thumbnail URLs use `images-assets.nasa.gov`, while `src/screens/EventCard.jsx` only loads an image when its hostname is `images-api.nasa.gov`; those snapshot items therefore use the text fallback.

## Fonts

- Fredoka Variable — `@fontsource-variable/fredoka` 5.2.6; SIL Open Font License (OFL).
- Lexend Variable — `@fontsource-variable/lexend` 5.2.6; SIL Open Font License (OFL).

## Libraries

Application dependencies:

- React and React DOM 18.3.1
- Zustand 5.0.8
- Framer Motion 12.23.24
- Lucide React 0.468.0
- Recharts 3.10.1
- canvas-confetti 1.9.3
- html-to-image 1.11.13
- vite-plugin-pwa 0.21.2
- Fredoka Variable and Lexend Variable 5.2.6

Build and test dependencies:

- Vite 6.4.6
- Tailwind CSS 3.4.17
- Vitest 3.2.7
- sharp 0.34.5 (temporary app-icon generation script)
- PostCSS 8.5.33 and Autoprefixer 10.4.21

## Project license

The repository's `LICENSE` file identifies the project license as Apache License 2.0.
