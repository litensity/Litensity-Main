import "server-only";
import { createSign } from "node:crypto";
import { serverEnv } from "@/lib/env";

/*
 * Minimal Google Sheets v4 client: service-account JWT → OAuth token → REST.
 * Avoids the very large `googleapis` package. Every form has its own sheet/tab,
 * configured in Admin → Settings → Forms.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const API = "https://sheets.googleapis.com/v4/spreadsheets";

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(): Promise<string> {
  const creds = serverEnv.google;
  if (!creds) throw new SheetsNotConfiguredError();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: creds.email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${base64url(signer.sign(creds.privateKey))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google OAuth failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export class SheetsNotConfiguredError extends Error {
  constructor() {
    super("Google Sheets credentials are not configured");
  }
}

async function call(path: string, init: RequestInit): Promise<Response> {
  const token = await accessToken();
  const res = await fetch(`${API}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Sheets ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

const quoteTab = (tab: string) => `'${tab.replace(/'/g, "''")}'`;

/** Cell values are written RAW so user input can never be interpreted as a formula. */
type Cell = string | number | boolean | null;

const headerChecked = new Set<string>();

/** Writes the header row once if the tab is empty. Trailing columns stay free for HR/sales status. */
async function ensureHeader(sheetId: string, tab: string, header: string[]) {
  const key = `${sheetId}:${tab}`;
  if (headerChecked.has(key)) return;
  const res = await call(`${sheetId}/values/${encodeURIComponent(`${quoteTab(tab)}!1:1`)}`, { method: "GET" });
  const json = (await res.json()) as { values?: string[][] };
  if (!json.values?.[0]?.length) {
    await call(
      `${sheetId}/values/${encodeURIComponent(`${quoteTab(tab)}!A1`)}?valueInputOption=RAW`,
      { method: "PUT", body: JSON.stringify({ values: [header] }) },
    );
  }
  headerChecked.add(key);
}

/** Appends one row; returns the A1 range written (stored so the row can be updated later). */
export async function appendRow(sheetId: string, tab: string, header: string[], row: Cell[]): Promise<string> {
  await ensureHeader(sheetId, tab, header);
  const res = await call(
    `${sheetId}/values/${encodeURIComponent(`${quoteTab(tab)}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row.map((v) => (v === null ? "" : v))] }) },
  );
  const json = (await res.json()) as { updates?: { updatedRange?: string } };
  return json.updates?.updatedRange ?? "";
}

/** Updates a single cell in a previously appended row, e.g. the OTP status column. */
export async function updateRowCell(sheetId: string, appendedRange: string, columnIndex: number, value: Cell) {
  // appendedRange looks like 'Downloads'!A12:K12
  const match = appendedRange.match(/^(.*)!([A-Z]+)(\d+)/);
  if (!match) throw new Error(`Unrecognised range: ${appendedRange}`);
  const [, tab, , rowNumber] = match;
  const column = columnLetter(columnIndex);
  await call(
    `${sheetId}/values/${encodeURIComponent(`${tab}!${column}${rowNumber}`)}?valueInputOption=RAW`,
    { method: "PUT", body: JSON.stringify({ values: [[value ?? ""]] }) },
  );
}

function columnLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
