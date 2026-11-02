// Renders the blurred colour art (home hero, one per game) as small PNGs.
// Smooth gradients stay soft when the app scales them up, so no blur package is needed.
//   node scripts/make-art.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const smooth = (t) => t * t * (3 - 2 * t);

// [colour, x, y, radius] in 0..1 space of the image; first entry is the base wash.
const ART = {
  'hero-light': { w: 200, h: 220, base: '#FFD9C2', blobs: [['#FF8A4C', 0.18, 0.2, 0.85], ['#F0452B', 0.9, 0.3, 0.8], ['#8E9BB8', 0.5, 1.1, 0.9]] },
  'hero-dark': { w: 200, h: 220, base: '#2E1712', blobs: [['#C2501F', 0.18, 0.2, 0.85], ['#A8261A', 0.9, 0.3, 0.8], ['#4C5878', 0.5, 1.1, 0.9]] },
  'mafia-light': { w: 240, h: 90, base: '#FFC9B0', blobs: [['#F0452B', 0.15, 0.3, 0.7], ['#FF8A4C', 0.88, 0.75, 0.7], ['#8E9BB8', 0.5, 1.3, 0.8]] },
  'mafia-dark': { w: 240, h: 90, base: '#26110E', blobs: [['#A8261A', 0.15, 0.3, 0.7], ['#C2501F', 0.88, 0.75, 0.7], ['#4C5878', 0.5, 1.3, 0.8]] },
  'imposter-light': { w: 240, h: 90, base: '#DDE2EE', blobs: [['#8E9BB8', 0.12, 0.3, 0.75], ['#FF8A4C', 0.9, 0.15, 0.65], ['#F0452B', 0.62, 1.3, 0.7]] },
  'imposter-dark': { w: 240, h: 90, base: '#121826', blobs: [['#4C5878', 0.12, 0.3, 0.75], ['#C2501F', 0.9, 0.15, 0.65], ['#A8261A', 0.62, 1.3, 0.7]] },
};

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('assets/art', { recursive: true });
for (const [name, a] of Object.entries(ART)) {
  const px = Buffer.alloc(a.w * a.h * 3);
  const base = hex(a.base);
  const aspect = a.w / a.h;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
    let c = base.slice();
    for (const [col, bx, by, br] of a.blobs) {
      const dx = (x / a.w - bx) * Math.min(aspect, 1.6), dy = y / a.h - by;
      const d = Math.sqrt(dx * dx + dy * dy) / br;
      const w = d >= 1 ? 0 : smooth(1 - d);
      const rgb = hex(col);
      c = c.map((v, i) => v + (rgb[i] - v) * w * 0.95);
    }
    const n = (Math.random() - 0.5) * 3; // light dither so gradients don't band
    for (let i = 0; i < 3; i++) px[(y * a.w + x) * 3 + i] = Math.max(0, Math.min(255, Math.round(c[i] + n)));
  }
  writeFileSync(`assets/art/${name}.png`, png(a.w, a.h, px));
  console.log('wrote', name);
}
