import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const source = await readFile(path.join(ROOT, 'public', 'favicon.svg'));
const outputDir = path.join(ROOT, 'public', 'icons');

await mkdir(outputDir, { recursive: true });
await Promise.all([
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
  [512, 'icon-512-maskable.png'],
].map(([size, name]) => sharp(source)
  .resize(size, size, { fit: 'contain' })
  .png()
  .toFile(path.join(outputDir, name))));

console.log('Generated 192px, 512px, and maskable Outpost icons from public/favicon.svg.');
