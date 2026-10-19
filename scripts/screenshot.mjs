// Headless screenshots with a local Chrome, also used for the portfolio covers.
// Usage: node scripts/screenshot.mjs <url> <out.png> [width] [height] [waitMs] [--scroll=#selector|px] [--reduced] [--mobile]
import { chromium } from "playwright-core";

const [url = "http://localhost:3000", out = "shot.png", w = "1600", h = "1200", wait = "3500", ...flags] =
  process.argv.slice(2);
const flag = (name) => flags.find((f) => f.startsWith(`--${name}`));
const scroll = flag("scroll")?.split("=")[1];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  isMobile: !!flag("mobile"),
  hasTouch: !!flag("mobile"),
});
const page = await context.newPage();
const logs = [];
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(Number(wait));
if (scroll) {
  await page.evaluate((s) => {
    const y = /^\d+$/.test(s) ? Number(s) : document.querySelector(s).getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, y);
  }, scroll);
  await page.waitForTimeout(1500);
}
await page.screenshot({ path: out });
await browser.close();
console.log(logs.length ? logs.join("\n") : "no console errors/warnings");
