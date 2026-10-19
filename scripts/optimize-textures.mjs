// One-off: shrink the NASA textures used by the globe into small web-friendly files.
import sharp from "sharp";
import { rm } from "node:fs/promises";

const dir = "public/textures";
const jobs = [
  // ocean/land mask (white = water), grayscale is enough
  { src: "earth-water.png", out: "earth-mask.jpg", width: 2048, gray: true, q: 80 },
  { src: "earth-water.png", out: "earth-mask-sm.jpg", width: 1024, gray: true, q: 75 },
  // city lights, used as a gold sparkle layer on land
  { src: "earth-night.jpg", out: "earth-lights.jpg", width: 2048, gray: true, q: 78 },
];

for (const j of jobs) {
  let img = sharp(`${dir}/${j.src}`).resize({ width: j.width });
  if (j.gray) img = img.grayscale();
  const info = await img.jpeg({ quality: j.q, mozjpeg: true }).toFile(`${dir}/${j.out}`);
  console.log(j.out, info.width + "x" + info.height, Math.round(info.size / 1024) + "KB");
}
for (const f of ["earth-water.png", "earth-night.jpg", "earth-blue-marble.jpg", "earth-topology.png", "earth-dark.jpg"]) {
  await rm(`${dir}/${f}`);
}
