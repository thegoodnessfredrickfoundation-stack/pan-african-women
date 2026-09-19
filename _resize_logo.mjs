// The source logo PNG is 1354 KB — larger than the entire rest of the site.
// It is displayed at 52-64px, so we generate a small, retina-adequate copy.
// Pure Node has no image encoder, so we decode/scale the PNG by hand using
// zlib (which Node has built in) and a box filter.
import { readFile, writeFile } from "node:fs/promises";
import zlib from "node:zlib";

const src = "pan african women logo.png";
const buf = await readFile(src);

// --- minimal PNG decode ---
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error("bitDepth " + bitDepth + " unsupported");

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error("colorType " + colorType + " unsupported");

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);

  // un-filter (PNG filters 0..4)
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (ft) {
        case 0: break;
        case 1: v = (v + a) & 255; break;
        case 2: v = (v + b) & 255; break;
        case 3: v = (v + ((a + b) >> 1)) & 255; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          v = (v + pr) & 255; break;
        }
      }
      cur[x] = v;
    }
  }
  return { w, h, channels, pixels: out };
}

// --- box-filter downscale ---
function scale(img, tw, th) {
  const { w, h, channels, pixels } = img;
  const out = Buffer.alloc(tw * th * channels);
  const xr = w / tw, yr = h / th;
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const x0 = Math.floor(x * xr), x1 = Math.min(w, Math.ceil((x + 1) * xr));
      const y0 = Math.floor(y * yr), y1 = Math.min(h, Math.ceil((y + 1) * yr));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * w + sx) * channels;
          if (channels >= 3) { r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; }
          else { r = g = b = pixels[i]; }
          if (channels === 4) a += pixels[i + 3];
          else if (channels === 2) a += pixels[i + 1];
          n++;
        }
      }
      const o = (y * tw + x) * channels;
      if (channels >= 3) {
        out[o] = Math.round(r / n); out[o + 1] = Math.round(g / n); out[o + 2] = Math.round(b / n);
      } else { out[o] = Math.round(r / n); }
      if (channels === 4) out[o + 3] = Math.round(a / n);
      else if (channels === 2) out[o + 1] = Math.round(a / n);
    }
  }
  return { w: tw, h: th, channels, pixels: out };
}

// --- minimal PNG encode (RGBA, filter 0) ---
function encodePNG(img) {
  const { w, h, channels, pixels } = img;
  const stride = w * channels;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const deflated = zlib.deflateSync(raw, { level: 9 });

  const chunks = [];
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  chunks.push(sig);

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t = Buffer.from(type, "ascii");
    const crcBuf = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcBuf) >>> 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  chunks.push(chunk("IHDR", ihdr));
  chunks.push(chunk("IDAT", deflated));
  chunks.push(chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

let table = null;
function crc32(buf) {
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = 0xffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return c ^ 0xffff;
}

console.log("decoding " + src + " ...");
const img = decodePNG(buf);
console.log("  source: " + img.w + "x" + img.h + " ch=" + img.channels);

for (const size of [160, 96]) {
  const s = scale(img, size, size);
  const png = encodePNG(s);
  const out = "website/assets/logo-" + size + ".png";
  await writeFile(out, png);
  console.log("  " + out + "  " + Math.round(png.length / 1024) + " KB");
}
