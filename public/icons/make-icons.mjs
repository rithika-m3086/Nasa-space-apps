import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('./icon.svg', import.meta.url));

await sharp(source).resize(192, 192).png().toFile(fileURLToPath(new URL('./icon-192.png', import.meta.url)));
await sharp(source).resize(512, 512).png().toFile(fileURLToPath(new URL('./icon-512.png', import.meta.url)));
await sharp(source).resize(512, 512).png().toFile(fileURLToPath(new URL('./icon-512-maskable.png', import.meta.url)));
