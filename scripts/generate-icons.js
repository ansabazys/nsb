const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function makeCrcTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcData), 8 + len);
  return buf;
}

function createPng(width, height, getPixel) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw scanlines with filter byte 0
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const idat = makeChunk('IDAT', zlib.deflateSync(rawData, { level: 9 }));
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Draw pixel logic for NSB icon
function drawNsbIcon(x, y, w, h) {
  // Center coordinates normalized -1 to 1
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const r = Math.sqrt(nx * nx + ny * ny);

  // Background: Deep dark gradient with subtle radial glow
  let bgR = 8, bgG = 8, bgB = 12, bgA = 255;
  if (r < 0.95) {
    const glow = Math.max(0, 1 - r * 0.9);
    bgR = Math.min(255, Math.floor(10 + glow * 15));
    bgG = Math.min(255, Math.floor(10 + glow * 20));
    bgB = Math.min(255, Math.floor(18 + glow * 35));
  }

  // Rounded squircle border
  // Distance from center with superellipse formula (x^4 + y^4)
  const squircle = Math.pow(Math.abs(nx), 3.5) + Math.pow(Math.abs(ny), 3.5);
  if (squircle > 0.88 && squircle <= 0.96) {
    // Elegant border
    return [60, 65, 85, 255];
  } else if (squircle > 0.96) {
    // Outside squircle: transparent or black
    return [0, 0, 0, 255];
  }

  // Draw "N S B" stylized letters
  // Define bounding box for letters: y from -0.35 to 0.35
  const inY = ny >= -0.32 && ny <= 0.32;
  const thick = 0.075;

  let isLetter = false;

  // Letter N: x from -0.65 to -0.22
  if (inY) {
    // Left stem of N
    if (nx >= -0.62 && nx <= -0.62 + thick) isLetter = true;
    // Right stem of N
    if (nx >= -0.25 - thick && nx <= -0.25) isLetter = true;
    // Diagonal of N
    const diagX = -0.62 + ((ny + 0.32) / 0.64) * (0.37);
    if (Math.abs(nx - diagX) < thick * 0.7) isLetter = true;
  }

  // Letter S: x from -0.18 to 0.18
  if (inY) {
    const sLeft = -0.15, sRight = 0.15;
    // Top horizontal
    if (ny >= -0.32 && ny <= -0.32 + thick && nx >= sLeft && nx <= sRight) isLetter = true;
    // Middle horizontal
    if (ny >= -thick / 2 && ny <= thick / 2 && nx >= sLeft && nx <= sRight) isLetter = true;
    // Bottom horizontal
    if (ny >= 0.32 - thick && ny <= 0.32 && nx >= sLeft && nx <= sRight) isLetter = true;
    // Top-left vertical
    if (ny >= -0.32 && ny <= 0 && nx >= sLeft && nx <= sLeft + thick) isLetter = true;
    // Bottom-right vertical
    if (ny >= 0 && ny <= 0.32 && nx >= sRight - thick && nx <= sRight) isLetter = true;
  }

  // Letter B: x from 0.25 to 0.65
  if (inY) {
    const bLeft = 0.25, bRight = 0.58;
    // Vertical spine
    if (nx >= bLeft && nx <= bLeft + thick) isLetter = true;
    // Top horizontal
    if (ny >= -0.32 && ny <= -0.32 + thick && nx >= bLeft && nx <= bRight - 0.05) isLetter = true;
    // Middle horizontal
    if (ny >= -thick / 2 && ny <= thick / 2 && nx >= bLeft && nx <= bRight) isLetter = true;
    // Bottom horizontal
    if (ny >= 0.32 - thick && ny <= 0.32 && nx >= bLeft && nx <= bRight - 0.05) isLetter = true;
    // Top loop curve (right side)
    if (ny >= -0.32 && ny <= 0 && nx >= bRight - thick - 0.03 && nx <= bRight - 0.03) isLetter = true;
    // Bottom loop curve (right side)
    if (ny >= 0 && ny <= 0.32 && nx >= bRight - thick && nx <= bRight) isLetter = true;
  }

  if (isLetter) {
    // Pure crisp white with subtle blue tone
    return [255, 255, 255, 255];
  }

  // Subtle decorative dot below the logo (cyan accent)
  const dotX = 0, dotY = 0.52;
  const distDot = Math.sqrt((nx - dotX) * (nx - dotX) + (ny - dotY) * (ny - dotY));
  if (distDot < 0.05) {
    return [56, 189, 248, 255]; // Sky-400 accent dot
  }

  return [bgR, bgG, bgB, bgA];
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Generate sizes
const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-192x192.png', size: 192 },
  { name: 'icon-maskable-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

for (const { name, size } of sizes) {
  const filePath = path.join(iconsDir, name);
  const buf = createPng(size, size, drawNsbIcon);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated: ${name} (${size}x${size}, ${buf.length} bytes)`);
}

// Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#101828" />
      <stop offset="50%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#030508" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)" stroke="#1e293b" stroke-width="6" />
  <rect width="500" height="500" x="6" y="6" rx="122" fill="none" stroke="url(#glow)" stroke-width="2" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', monospace" font-size="140" font-weight="900" fill="#ffffff" letter-spacing="12">NSB</text>
  <circle cx="256" cy="380" r="10" fill="#38bdf8" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('Generated: icon.svg');
