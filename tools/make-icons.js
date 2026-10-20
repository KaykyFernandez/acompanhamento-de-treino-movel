// Renders the launcher icon (gold gradient + dumbbell) to PNGs for the iOS/PWA build.
// Usage: node tools/make-icons.js
const fs = require("fs"), zlib = require("zlib"), path = require("path");
const OUT = path.join(__dirname, "..", "app", "src", "main", "assets", "icons");

const STOPS = [[0, [0xf6, 0xdd, 0x8a]], [0.5, [0xd4, 0xa7, 0x2c]], [1, [0x9c, 0x74, 0x16]]];
// Same paths as ic_launcher_foreground.xml, in a 24-unit box.
const SEGS = [[6, 7, 6, 17], [18, 7, 18, 17], [3, 10, 3, 14], [21, 10, 21, 14], [6, 12, 18, 12]];
const INK = [0x16, 0x13, 0x0a];

function grad(t) {
  for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) {
    const [t0, a] = STOPS[i - 1], [t1, b] = STOPS[i], k = (t - t0) / (t1 - t0);
    return a.map((v, j) => v + (b[j] - v) * k);
  }
  return STOPS[STOPS.length - 1][1];
}
function segDist(px, py, [x1, y1, x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
}
function render(size, scale) {
  const raw = Buffer.alloc((size * 3 + 1) * size), half = 1.1, ss = 4;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const bg = grad((x + y) / (2 * size));
      let cover = 0;
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        // Map pixel to the 24-unit glyph box, centered and scaled.
        const gx = 12 + ((x + (sx + .5) / ss) / size * 24 - 12) / scale, gy = 12 + ((y + (sy + .5) / ss) / size * 24 - 12) / scale;
        if (SEGS.some(s => segDist(gx, gy, s) <= half)) cover++;
      }
      const a = cover / (ss * ss), o = y * (size * 3 + 1) + 1 + x * 3;
      for (let c = 0; c < 3; c++) raw[o + c] = Math.round(bg[c] * (1 - a) + INK[c] * a);
    }
  }
  return png(size, raw);
}
function png(size, raw) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (~c) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]), cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, cr]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

fs.mkdirSync(OUT, { recursive: true });
// iOS masks its own rounded corners; maskable icons need the glyph inside the safe zone.
for (const [name, size, scale] of [["apple-touch-icon.png", 180, .62], ["icon-192.png", 192, .62], ["icon-512.png", 512, .62], ["maskable-512.png", 512, .5]]) {
  fs.writeFileSync(path.join(OUT, name), render(size, scale));
  console.log(name);
}
