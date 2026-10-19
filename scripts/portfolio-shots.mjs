// Portfolio covers (1600×1200) → /portfolio-assets
// Usage: node scripts/portfolio-shots.mjs [baseUrl]   (default http://localhost:3000)
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = "portfolio-assets";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});

async function open() {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  // hide the Next.js dev badge if shooting against `next dev`
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.waitForTimeout(3500);
  return page;
}
const sectionTop = (page, sel) =>
  page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);

// 1. Globe hero, Santorini route highlighted
let page = await open();
await page.waitForTimeout(3000);
await page.hover("nav[aria-label='Destinations on the globe'] >> text=Santorini");
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/01-globe-hero.png` });

// 2. Destinations scroll story, mid-way (Kyoto card)
page = await open();
const destTop = await sectionTop(page, "#destinations");
await page.evaluate((y) => window.scrollTo(0, y + window.innerWidth), destTop);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/02-destination-scroll.png` });

// 3. Trip finder with a filter applied
page = await open();
await page.evaluate((y) => window.scrollTo(0, y + 40), await sectionTop(page, "#trip-finder"));
await page.waitForTimeout(1200);
await page.click("#trip-finder button:has-text('Culture')");
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/03-trip-finder.png` });

await browser.close();
console.log(`saved 3 covers to ${OUT}/`);
