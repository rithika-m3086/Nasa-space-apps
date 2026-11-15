# Outpost Command

A browser mission game for junior flight directors exploring the Moon and Mars.

## Run locally

```sh
npm install
npm run dev
```

## Deploy

### Vercel

1. Import this repository in Vercel.
2. Set the framework preset to **Vite**.
3. Add `VITE_NASA_API_KEY` in the project environment variables.
4. Deploy. The app builds with `npm run build`.

### Netlify fallback

Run `npm run build`, then drag the generated `dist/` folder into Netlify's deploy area.

### Offline check

Run `npm run check:offline`, then start `npm run preview`. In browser DevTools, enable
**Network > Offline** and reload. The installed app should still open and show its saved
mission data.
