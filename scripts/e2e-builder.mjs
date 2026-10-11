// Page builder end-to-end: node scripts/e2e-builder.mjs (dev server + admin user required)
import { chromium } from "playwright-core";

const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const pub = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const results = [];
const check = (name, ok, detail = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
const sectionKinds = async (path) => {
  await pub.goto(`${base}${path}`, { waitUntil: "networkidle" });
  return pub.$$eval("[data-section]", (els) => els.map((e) => e.getAttribute("id")));
};
const toast = async (text) => page.locator(".b-toast", { hasText: text }).first().waitFor({ timeout: 20000 });
const card = (text) => page.locator(".b-card", { has: page.locator(".b-summary", { hasText: text }) }).first();

try {
  await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', process.env.QA_ADMIN_EMAIL ?? "admin@litensity.local");
  await page.fill('input[name="password"]', process.env.QA_ADMIN_PASSWORD ?? "Local-Dev-Password-2026");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/);
  await page.goto(`${base}/admin/pages/about`, { waitUntil: "networkidle" });

  const before = await sectionKinds("/about");

  // Hide
  await card("Many brands").locator('button[aria-label="Hide section"]').click();
  await toast("hidden");
  let after = await sectionKinds("/about");
  check("hide removes section from live page", !after.includes("thinking") && before.includes("thinking"));
  await card("Many brands").locator('button[aria-label="Show section"]').click();
  await toast("visible again");
  after = await sectionKinds("/about");
  check("show restores it", after.includes("thinking"));

  // Move down
  await card("Many brands").locator('button[aria-label="Move down"]').click();
  await toast("Order saved");
  after = await sectionKinds("/about");
  check("move down reorders live page", after.indexOf("thinking") > after.indexOf("milestones"), after.join(","));
  await card("Many brands").locator('button[aria-label="Move up"]').click();
  await toast("Order saved");

  // Duplicate
  await card("Many brands").locator('button[aria-label="Duplicate section"]').click();
  await toast("duplicated");
  after = await sectionKinds("/about");
  check("duplicate adds a copy", after.filter((k) => k.startsWith("thinking")).length === 2, after.join(","));

  // Edit the copy (opened automatically) and save
  const editor = page.locator(".b-card[data-open] .b-editor");
  await editor.locator("textarea").first().fill("QA duplicated *statement*");
  await editor.getByRole("button", { name: "Save section" }).click();
  await toast("Saved");
  await pub.goto(`${base}/about`, { waitUntil: "networkidle" });
  check("edited copy is live", (await pub.locator('[aria-label="QA duplicated statement"]').count()) === 1);

  // Delete the copy
  await page.locator(".b-card[data-open]").locator('button[aria-label="Delete section"]').click();
  await toast("deleted");
  after = await sectionKinds("/about");
  check("delete removes copy", after.filter((k) => k.startsWith("thinking")).length === 1);

  // Add a new building block with items
  await page.getByRole("button", { name: "+ Add section" }).click();
  await page.locator(".b-kind-card", { hasText: "FAQ" }).click();
  await toast("Section added");
  const ed = page.locator(".b-card[data-open] .b-editor");
  await ed.getByRole("button", { name: "+ Add question" }).click();
  await ed.locator('input[aria-label="Question"]').fill("QA question?");
  await ed.locator('textarea[aria-label="Answer"]').fill("QA answer.");
  await ed.getByRole("button", { name: "Save section" }).click();
  await toast("Saved");
  await pub.goto(`${base}/about`, { waitUntil: "networkidle" });
  check("new FAQ block live with its question", (await pub.locator("summary", { hasText: "QA question?" }).count()) === 1);
  await page.locator(".b-card[data-open]").locator('button[aria-label="Delete section"]').click();
  await toast("deleted");

  // Unique / pinned guards
  check("hero cannot be deleted", await page.locator(".b-card").first().locator('button[aria-label="Delete section"]').isDisabled());
  check("founders block cannot be duplicated", await card("Meet the founders").locator('button[aria-label="Duplicate section"]').isDisabled());
} catch (err) {
  check("unexpected error", false, err.message.split("\n")[0]);
}
console.log(results.join("\n"));
if (errors.length) console.log("page errors:", errors.slice(0, 5));
await browser.close();
