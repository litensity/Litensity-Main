import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";

/** Keyed hash so IPs, OTP codes and tokens are never stored in plain text. */
export function hmac(value: string): string {
  return createHmac("sha256", serverEnv.appSecret).update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += randomInt(0, 10).toString();
  return out;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window rate limit backed by Postgres (`rate_limit_hit`), so limits hold
 * across serverless instances. Returns true when the request may proceed.
 * Fails open on infrastructure errors so a DB hiccup never blocks real leads.
 */
export async function rateLimit(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const db = createServiceClient();
    const { data, error } = await db.rpc("rate_limit_hit", {
      p_bucket: hmac(bucket),
      p_window_seconds: windowSeconds,
      p_max: max,
    });
    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error("[rate-limit] failing open:", err);
    return true;
  }
}

/** Minimum time a human needs to fill a form; faster submissions are treated as bots. */
export const MIN_FILL_MS = 2500;

export function looksLikeBot(meta: { website?: string; startedAt: number }): boolean {
  if (meta.website) return true;
  const elapsed = Date.now() - meta.startedAt;
  return elapsed < MIN_FILL_MS || elapsed > 1000 * 60 * 60 * 24;
}
