// gen-icons.js —— 零依赖生成 PWA 图标（手工编码 PNG）
// 设计：淡蓝渐变圆角底 + 白色圆角面板 + 三条蓝色横线（工作台/列表意象）
// 运行：node scripts/gen-icons.js
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'icons');

// ---------- PNG 编码 ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- 绘制 ----------
function roundedRectDist(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return 1;
  const cx = Math.max(x0 + r, Math.min(px, x1 - r));
  const cy = Math.max(y0 + r, Math.min(py, y1 - r));
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy - r * r;
}
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

function drawIcon(size) {
  const s = size / 512; // 以 512 为基准坐标
  const buf = Buffer.alloc(size * size * 4);
  const r0 = 110 * s, r1 = 30 * s; // 背景圆角 / 面板圆角
  const panel = { x0: 128 * s, y0: 168 * s, x1: 384 * s, y1: 352 * s };
  const lines = [
    { y: 214 * s, w: 22 * s },
    { y: 262 * s, w: 22 * s },
    { y: 310 * s, w: 22 * s },
  ];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let R = 0, G = 0, B = 0, A = 0;
      // 背景圆角矩形（淡蓝渐变）
      if (roundedRectDist(x + 0.5, y + 0.5, 0, 0, size, size, r0) <= 0) {
        const t = y / size;
        R = lerp(0x4a, 0x2f, t); G = lerp(0xa8, 0x86, t); B = lerp(0xff, 0xe0, t);
        A = 255;
        // 白色面板
        if (roundedRectDist(x + 0.5, y + 0.5, panel.x0, panel.y0, panel.x1, panel.y1, r1) <= 0) {
          R = 255; G = 255; B = 255;
          // 三条蓝色横线
          for (const ln of lines) {
            const ly0 = ln.y, ly1 = ln.y + ln.w;
            if (y >= ly0 && y < ly1 && x >= panel.x0 + 42 * s && x <= panel.x1 - 42 * s) {
              R = 0x3b; G = 0x9e; B = 0xff;
            }
          }
        }
      }
      buf[i] = R; buf[i + 1] = G; buf[i + 2] = B; buf[i + 3] = A;
    }
  }
  return encodePNG(size, size, buf);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'icon-192.png'), drawIcon(192));
writeFileSync(join(OUT, 'icon-512.png'), drawIcon(512));
console.log('✔ 图标已生成：app/icons/icon-192.png, icon-512.png');
