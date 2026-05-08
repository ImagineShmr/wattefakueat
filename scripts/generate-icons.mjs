import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const iconsDir = path.resolve(root, 'static/icons');

if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

function crc32(buf) {
  let crc = 0xffffffff;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

function chunk(type, data) {
  const len = u32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([t, data]);
  const c = u32BE(crc32(crcData));
  return Buffer.concat([len, t, data, c]);
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = [];
  const cx = size / 2, cy = size / 2, mr = size * 0.42;

  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= mr) {
        const t = 1 - (dist / mr) * 0.5;
        raw.push(r, Math.min(255, Math.round(g * t)), Math.min(255, Math.round(b * t)), 255);
      } else {
        const fade = Math.max(0, 1 - (dist - mr) / 6);
        const a = Math.round(255 * fade);
        raw.push(r, g, b, a);
      }
    }
  }

  const compressed = deflateSync(Buffer.from(raw));
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, iend]);
}

const icon192 = createPNG(192, 0, 212, 255);
const icon512 = createPNG(512, 0, 212, 255);

writeFileSync(path.resolve(iconsDir, '192.png'), icon192);
writeFileSync(path.resolve(iconsDir, '512.png'), icon512);
console.log('Generated PWA icons');
