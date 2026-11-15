import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const DATA_DIR = fileURLToPath(new URL('./src/data/', import.meta.url));

function emitScienceData() {
  return {
    name: 'outpost-science-data',
    apply: 'build',
    generateBundle() {
      for (const fileName of readdirSync(DATA_DIR).filter((name) => name.endsWith('.json'))) {
        this.emitFile({
          type: 'asset',
          fileName: `data/${fileName}`,
          source: readFileSync(new URL(`./src/data/${fileName}`, import.meta.url)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [
    emitScienceData(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Outpost Command',
        short_name: 'Outpost',
        theme_color: '#0B1020',
        background_color: '#0B1020',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json,webmanifest}'],
      },
    }),
  ],
});
