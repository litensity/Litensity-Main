// Browser-level form checks against a running dev server. node scripts/e2e-forms.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
const check = (name, ok, detail = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);

async function fill(form, values) {
  for (const [name, value] of Object.entries(values)) {
    const el = form.locator(`[name="${name}"]`);
    const tag = await el.evaluate((n) => n.tagName.toLowerCase());
    if (tag === "select") {
      const opts = await el.locator("option:not([disabled])").allTextContents();
      await el.selectOption(value === "*" ? { label: opts[0] } : value);
    } else await el.fill(value);
  }
}

// 1. Franchise form: client validation, then a valid submission.
await page.goto(`${base}/brands/bigguys#enquire`, { waitUntil: "networkidle" });
let form = page.locator("#enquire form");
await form.locator('button[type="submit"]').click();
check("franchise: empty submit shows field errors", (await form.locator('[aria-invalid="true"]').count()) >= 4);
await fill(form, { name: "Asha Rao", phone: "98765 43210", email: "asha@example.com", city: "Bengaluru", preferredLocation: "Whitefield", budget: "*", timeline: "*", message: "Keen on a high-street store." });
await page.waitForTimeout(2700);
await form.locator('button[type="submit"]').click();
await page.locator("#enquire [role=status]").waitFor({ timeout: 15000 }).catch(() => {});
check("franchise: success message", await page.locator("#enquire [role=status]").isVisible(), await page.locator("#enquire [role=alert]").textContent().catch(() => ""));

// 2. Belgian Waffle: general enquiry, tagged with the brand.
await page.goto(`${base}/brands/belgian-waffle#enquire`, { waitUntil: "networkidle" });
form = page.locator("#enquire form");
await fill(form, { name: "Ravi K", phone: "+91 91234 56789", email: "ravi@example.com", enquiryType: "*", message: "Loved the waffles in Jayanagar!" });
await page.waitForTimeout(2700);
await form.locator('button[type="submit"]').click();
await page.locator("#enquire [role=status]").waitFor({ timeout: 15000 }).catch(() => {});
check("belgian-waffle: general enquiry success", await page.locator("#enquire [role=status]").isVisible());

// 3. Too-fast submission is silently dropped (bot heuristic) — still shows success.
await page.reload({ waitUntil: "networkidle" });
form = page.locator("#enquire form");
await fill(form, { name: "Bot Bot", phone: "9123456789", email: "bot@example.com", enquiryType: "*", message: "spam spam spam" });
await form.locator('button[type="submit"]').click();
await page.waitForTimeout(1500);

// 4. Careers application with a resume upload (if the careers page exists).
const careers = await page.goto(`${base}/careers`, { waitUntil: "networkidle" });
if (careers?.ok()) {
  form = page.locator("#apply form");
  fs.writeFileSync("C:/Windows/Temp/cv.pdf", "%PDF-1.4\n%%EOF\n");
  await fill(form, { name: "Meera S", email: "meera@example.com", phone: "9988776655", role: "Store Manager", city: "Pune", experience: "4" });
  await form.locator('input[type="file"]').setInputFiles("C:/Windows/Temp/cv.pdf");
  await page.waitForTimeout(2700);
  await form.locator('button[type="submit"]').click();
  await page.locator("#apply [role=status]").waitFor({ timeout: 15000 }).catch(() => {});
  check("careers: application with resume", await page.locator("#apply [role=status]").isVisible());
}

console.log(results.join("\n"));
if (errors.length) console.log("page errors:", errors);
await browser.close();
