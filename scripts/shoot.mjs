// Visual QA helper: node scripts/shoot.mjs <path> [width] [outName] [--full]
// Scrolls the page to trigger reveal animations, reports horizontal overflow and console errors.
import { chromium } from "playwright-core";

const [, , path = "/", width = "1440", out = "shot", ...flags] = process.argv;
const full = flags.includes("--full");
const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const dir = process.env.QA_OUT_DIR ?? ".";
const executablePath =
  process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath });
const w = Number(width);
const page = await browser.newPage({
  viewport: { width: w, height: w < 600 ? 844 : 900 },
  deviceScaleFactor: 1,
  isMobile: w < 600,
  hasTouch: w < 600,
});
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(base + path, { waitUntil: "networkidle" });
// Scroll through to trigger reveals, then back to top.
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < height; y += 500) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(1200);
const overflow = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && getComputedStyle(el).position !== "fixed") {
      offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(r.right)}px`);
    }
  }
  return { scrollWidth: document.documentElement.scrollWidth, vw, offenders: offenders.slice(0, 8) };
});
const at = Number((flags.find((f) => f.startsWith("--at=")) ?? "--at=0").slice(5));
await page.evaluate((top) => window.scrollTo(0, top), full ? 0 : at);
await page.waitForTimeout(700);
await page.screenshot({ path: `${dir}/${out}.png`, fullPage: full });
console.log(JSON.stringify({ path, width: w, overflow, errors: errors.slice(0, 10) }, null, 1));
await browser.close();
