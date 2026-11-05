import { deflateSync } from "node:zlib";

// Original 5×7 pixel alphabet, no font or rendering dependencies. Social cards
// transliterate Polish accents; HTML titles and OG alt text retain full Unicode.
const glyphs = {
  A: "01110 10001 10001 11111 10001 10001 10001",
  B: "11110 10001 10001 11110 10001 10001 11110",
  C: "01111 10000 10000 10000 10000 10000 01111",
  D: "11110 10001 10001 10001 10001 10001 11110",
  E: "11111 10000 10000 11110 10000 10000 11111",
  F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01111 10000 10000 10111 10001 10001 01110",
  H: "10001 10001 10001 11111 10001 10001 10001",
  I: "11111 00100 00100 00100 00100 00100 11111",
  J: "00111 00010 00010 00010 10010 10010 01100",
  K: "10001 10010 10100 11000 10100 10010 10001",
  L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001",
  N: "10001 11001 11001 10101 10011 10011 10001",
  O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000",
  Q: "01110 10001 10001 10001 10101 10010 01101",
  R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110",
  T: "11111 00100 00100 00100 00100 00100 00100",
  U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100",
  W: "10001 10001 10001 10101 10101 10101 01010",
  X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100",
  Z: "11111 00001 00010 00100 01000 10000 11111",
  0: "01110 10011 10101 10101 11001 10001 01110",
  1: "00100 01100 00100 00100 00100 00100 01110",
  2: "01110 10001 00001 00010 00100 01000 11111",
  3: "11110 00001 00001 01110 00001 00001 11110",
  4: "00010 00110 01010 10010 11111 00010 00010",
  5: "11111 10000 10000 11110 00001 00001 11110",
  6: "01110 10000 10000 11110 10001 10001 01110",
  7: "11111 00001 00010 00100 01000 01000 01000",
  8: "01110 10001 10001 01110 10001 10001 01110",
  9: "01110 10001 10001 01111 00001 00001 01110",
  "?": "01110 10001 00001 00010 00100 00000 00100",
  ".": "00000 00000 00000 00000 00000 00110 00110",
  "-": "00000 00000 00000 11111 00000 00000 00000",
  "/": "00001 00010 00010 00100 01000 01000 10000",
  ":": "00000 00110 00110 00000 00110 00110 00000",
};
const ascii = (s) =>
  s
    .replace(/[łŁ]/g, "L")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type),
    len = Buffer.alloc(4),
    crc = Buffer.alloc(4);
  len.writeUInt32BE(bytes.length);
  crc.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([len, name, bytes, crc]);
}
export function ogPng(title, simulated, lang) {
  const width = 1200,
    height = 630,
    rowSize = width * 3 + 1,
    pixels = Buffer.alloc(height * rowSize);
  function rect(x, y, w, h, color) {
    for (let py = Math.max(0, y); py < Math.min(height, y + h); py++)
      for (let px = Math.max(0, x); px < Math.min(width, x + w); px++) {
        const pos = py * rowSize + 1 + px * 3;
        pixels[pos] = color[0];
        pixels[pos + 1] = color[1];
        pixels[pos + 2] = color[2];
      }
  }
  rect(0, 0, width, height, [247, 245, 238]);
  const ink = [36, 40, 36],
    rust = [158, 62, 37];
  function text(value, x, y, size, color = ink) {
    for (const char of ascii(value)) {
      (glyphs[char] ?? (char === " " ? "" : glyphs["?"]))
        .split(" ")
        .forEach((row, j) =>
          [...row].forEach((bit, i) => {
            if (bit === "1")
              rect(x + i * size, y + j * size, size, size, color);
          }),
        );
      x += size * 6;
    }
  }
  text("WORLDVIEW", 64, 54, 7);
  rect(64, 135, 1072, 2, [200, 204, 192]);
  const normalized = ascii(title),
    lines = [];
  let line = "";
  for (const word of normalized.split(/\s+/)) {
    if ((line + " " + word).trim().length > 35) {
      if (line) lines.push(line);
      line = "";
    }
    if (word.length > 35) {
      lines.push(word.slice(0, 32) + "...");
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > 4) lines[3] = lines[3].slice(0, 32) + "...";
  lines.slice(0, 4).forEach((l, i) => text(l, 64, 190 + i * 60, 5));
  text(
    simulated
      ? lang === "pl"
        ? "DANE SYNTETYCZNE / NIE PRAWDZIWY MODEL"
        : "SYNTHETIC DATA / NOT A REAL MODEL"
      : "REVIEWED DATA / DANE PO PRZEGLADZIE",
    64,
    520,
    3,
    rust,
  );
  text("PL / EN - AN ATLAS OF ANSWERS, NOT TRUTH", 64, 570, 3);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
