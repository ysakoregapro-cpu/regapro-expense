import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");

const NAVY = { r: 30, g: 70, b: 99, alpha: 1 };

function svgRect(w, h, fill) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" rx="1" fill="${fill}"/></svg>`,
  );
}

async function makeIcon(size, { maskable = false, badge = false } = {}) {
  const pad = maskable
    ? Math.round(size * 0.18)
    : badge
      ? Math.round(size * 0.2)
      : Math.round(size * 0.22);
  const content = size - pad * 2;
  const barW = Math.max(2, Math.round(content * 0.12));
  const gap = Math.round(content * 0.18);
  const baselineH = Math.max(2, Math.round(content * 0.1));
  const baselineW = Math.round(content * 0.42);

  const leftX = pad + Math.round(content * 0.12);
  const craftX = leftX + barW + gap;
  const baseX = craftX + barW + Math.round(gap * 0.5);
  const topY = pad + Math.round(content * 0.08);
  const barH = content - Math.round(content * 0.22);
  const craftH = Math.round(barH * 0.78);
  const craftTop = topY + Math.round(barH * 0.11);
  const baseY = topY + barH - baselineH;

  const background = badge ? { r: 0, g: 0, b: 0, alpha: 0 } : NAVY;

  const composites = [
    {
      input: svgRect(barW, barH, "#FFFFFF"),
      left: leftX,
      top: topY,
    },
    {
      input: svgRect(barW, craftH, badge ? "#FFFFFF" : "#A77D45"),
      left: craftX,
      top: craftTop,
    },
    {
      input: svgRect(baselineW, baselineH, badge ? "#FFFFFF" : "#E8EEF2"),
      left: baseX,
      top: baseY,
    },
  ];

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

fs.mkdirSync(outDir, { recursive: true });

const files = [
  ["icon-192.png", await makeIcon(192)],
  ["icon-512.png", await makeIcon(512)],
  ["icon-maskable-512.png", await makeIcon(512, { maskable: true })],
  ["apple-touch-icon.png", await makeIcon(180)],
  ["badge-96.png", await makeIcon(96, { badge: true })],
];

for (const [name, buf] of files) {
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`wrote ${name} (${buf.length} bytes)`);
}
