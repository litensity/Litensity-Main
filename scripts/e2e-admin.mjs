// Admin CMS smoke test against a running dev server: node scripts/e2e-admin.mjs
import { chromium } from "playwright-core";

const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const email = process.env.QA_ADMIN_EMAIL ?? "admin@litensity.local";
const password = process.env.QA_ADMIN_PASSWORD ?? "Local-Dev-Password-2026";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
const results = [];
const check = (name, ok, detail = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);

try {
  // 1. Gate
  await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
  check("unauthenticated /admin redirects to login", page.url().includes("/admin/login"));

  // 2. Login
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/, { timeout: 20000 });
  check("login reaches dashboard", await page.locator("h1").first().isVisible());

  // 3. Every registered list renders
  const links = await page.$$eval(".admin-sidebar a.admin-nav-link", (as) => as.map((a) => a.getAttribute("href")));
  let broken = [];
  for (const href of links) {
    const res = await page.goto(`${base}${href}`, { waitUntil: "domcontentloaded" });
    if (!res?.ok() || (await page.locator("text=Application error").count())) broken.push(href);
  }
  check(`all ${links.length} admin screens render`, broken.length === 0, broken.join(", "));

  // 4. Create a store → appears publicly
  await page.goto(`${base}/admin/r/stores/new`, { waitUntil: "networkidle" });
  const brandOpt = await page.locator('select[name="brand_id"] option', { hasText: "Belgian Waffle" }).getAttribute("value");
  await page.selectOption('select[name="brand_id"]', brandOpt);
  await page.fill('input[name="name"]', "QA Test Store Whitefield");
  await page.fill('input[name="phone"]', "+91 80000 00000");
  await page.getByRole("tab", { name: "Address & location" }).click();
  await page.fill('textarea[name="address"]', "QA address line");
  await page.fill('input[name="locality"]', "Whitefield");
  await page.fill('input[name="city"]', "Bengaluru");
  await page.fill('input[name="state"]', "Karnataka");
  await page.fill('input[name="pincode"]', "12345"); // invalid on purpose
  await page.fill('input[name="latitude"]', "12.9698");
  await page.fill('input[name="longitude"]', "77.7500");
  await page.getByRole("tab", { name: "Store" }).click();
  await page.click('button[type="submit"]:has-text("Create")');
  await page.locator(".a-error").first().waitFor({ timeout: 15000 });
  check("invalid pincode rejected with message", (await page.locator(".a-error").first().textContent()).toLowerCase().includes("pincode"));
  check("form keeps input after error", (await page.inputValue('input[name="name"]')) === "QA Test Store Whitefield");
  await page.fill('input[name="pincode"]', "560066"); // tab switched automatically to the field with the error
  await page.click('button[type="submit"]:has-text("Create")');
  await page.waitForURL(/\/admin\/r\/stores\/[0-9a-f-]{36}\?saved=1/, { timeout: 20000 });
  check("store created", true);
  await page.goto(page.url().replace("?saved=1", ""), { waitUntil: "networkidle" });

  const pub = await browser.newPage();
  await pub.goto(`${base}/stores?brand=belgian-waffle`, { waitUntil: "networkidle" });
  check("new store on public locator", (await pub.locator("text=QA Test Store Whitefield").count()) > 0);
  await pub.goto(`${base}/brands/belgian-waffle`, { waitUntil: "networkidle" });
  check("new store on brand page", (await pub.locator("text=QA Test Store Whitefield").count()) > 0);

  // 5. Archive it → disappears
  await page.getByRole("tab", { name: "Store" }).click();
  await page.check('input[name="is_archived"]');
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.waitForURL(/saved=1/, { timeout: 20000 });
  await pub.goto(`${base}/stores?brand=belgian-waffle`, { waitUntil: "networkidle" });
  check("archived store hidden publicly", (await pub.locator("text=QA Test Store Whitefield").count()) === 0);

  // 6. Edit a page heading → live
  await page.goto(`${base}/admin/r/page-sections?page_key=home`, { waitUntil: "networkidle" });
  await page.locator("tr", { hasText: "hero" }).locator("a").first().click();
  await page.waitForURL(/page-sections\/[0-9a-f-]{36}/);
  const original = await page.inputValue('textarea[name="heading"]');
  await page.fill('textarea[name="heading"]', "QA heading *check*");
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.waitForURL(/saved=1/, { timeout: 20000 });
  await pub.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.goto(page.url().replace("?saved=1", ""), { waitUntil: "networkidle" });
  check("homepage heading updated from CMS", (await pub.locator("h1").getAttribute("aria-label")) === "QA heading check");
  await page.fill('textarea[name="heading"]', original);
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.waitForURL(/saved=1/, { timeout: 20000 });

  // 7. Brand feature guard: brochure without investment is rejected
  await page.goto(`${base}/admin/r/brands`, { waitUntil: "networkidle" });
  await page.locator("a", { hasText: "Belgian Waffle" }).first().click();
  await page.waitForURL(/brands\/[0-9a-f-]{36}/);
  await page.getByRole("tab", { name: "Features" }).click();
  await page.check('input[name="feature_brochure_download"]');
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.locator(".a-error").first().waitFor({ timeout: 15000 });
  check("brochure without investment block refused", (await page.locator(".a-error").first().textContent()).includes("investment block"));
} catch (err) {
  check("unexpected error", false, err.message.split("\n")[0]);
}
console.log(results.join("\n"));
if (pageErrors.length) console.log("page errors:", pageErrors.slice(0, 5));
await browser.close();
