import "server-only";
import { after } from "next/server";
import type { Json, Tables } from "@/types/database";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/admin";
import { deliverLead, getFormSettings, leadHeader } from "@/lib/leads/deliver";
import { updateRowCell } from "@/lib/sheets/google-sheets";
import { internalRecipients, sendEmail } from "@/lib/mail/mailer";
import { acknowledgement, internalLeadAlert } from "@/lib/mail/templates";
import { hmac, randomDigits, rateLimit, safeEqual } from "@/lib/security";
import { absoluteUrl } from "@/lib/site-url";
import { getOtpProvider, maskDestination } from "./providers";

export const OTP_TTL_MINUTES = 10;
export const RESEND_COOLDOWN_SECONDS = 45;
export const MAX_ATTEMPTS = 5;
export const MAX_SENDS = 4;
const RELEASE_TTL_MINUTES = 15;
const ATTACH_MAX_BYTES = 10 * 1024 * 1024;

export class OtpError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

const codeHash = (requestId: string, code: string) => hmac(`otp:${requestId}:${code}`);

interface DownloadRecord {
  id: string;
  kind: "menu" | "brochure";
  title: string;
  requires_otp: boolean;
  file: { bucket: string; path: string; mime_type: string; size_bytes: number } | null;
  brand: {
    slug: string;
    name: string;
    color_primary: string;
    feature_menu_download: boolean;
    feature_brochure_download: boolean;
    feature_investment: boolean;
    status: string;
  } | null;
}

/** Loads a download and enforces the brand feature matrix (no brochure for Belgian Waffle, etc.). */
async function loadDownload(downloadId: string): Promise<DownloadRecord> {
  const db = createServiceClient();
  const { data } = await db
    .from("downloads")
    .select(
      "id, kind, title, requires_otp, status, file:media!downloads_file_media_id_fkey(bucket, path, mime_type, size_bytes), brand:brands!downloads_brand_id_fkey(slug, name, color_primary, feature_menu_download, feature_brochure_download, feature_investment, status)",
    )
    .eq("id", downloadId)
    .eq("status", "published")
    .maybeSingle();
  const record = data as unknown as DownloadRecord | null;
  if (!record || !record.file || !record.brand || record.brand.status !== "published") {
    throw new OtpError("This file is not available.", 404);
  }
  const allowed =
    record.kind === "menu"
      ? record.brand.feature_menu_download
      : record.brand.feature_investment && record.brand.feature_brochure_download;
  if (!allowed) throw new OtpError("This file is not available.", 404);
  return record;
}

const KIND_LABEL = { menu: "Menu", brochure: "Franchise brochure" } as const;

/** Downloads sheet columns after the shared tagging columns. "OTP status" is updated in place on verify. */
const DOWNLOAD_FIELDS = ["File type", "File", "Consent", "OTP status"] as const;

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Visitor-facing filename with the file's real extension. */
function downloadFilename(title: string, mime: string): string {
  const base = title.replace(/[^\w\- ]+/g, "").trim() || "download";
  return `${base}.${EXTENSIONS[mime] ?? "pdf"}`;
}

async function issueReleaseToken(requestId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const db = createServiceClient();
  await db
    .from("otp_requests")
    .update({
      release_token_hash: hmac(`release:${token}`),
      release_expires_at: new Date(Date.now() + RELEASE_TTL_MINUTES * 60_000).toISOString(),
    })
    .eq("id", requestId);
  return token;
}

export interface OtpStart {
  requestId: string;
  channel: "email" | "sms";
  maskedDestination: string;
  resendInSeconds: number;
  /** Present when the file does not require OTP — released immediately. */
  downloadUrl?: string;
}

/** Step 1–3: capture the lead (as Unverified), send the code. */
export async function startDownload(input: {
  downloadId: string;
  name: string;
  email: string;
  phone: string;
  ip: string;
  sourcePage: string;
  sourceSection?: string;
}): Promise<OtpStart> {
  const download = await loadDownload(input.downloadId);
  const provider = getOtpProvider();
  const destination = provider.destination(input);

  const [byPhone, byDest, byIp, byPhoneDaily] = await Promise.all([
    rateLimit(`otp:phone:${input.phone}`, 3, 600),
    rateLimit(`otp:dest:${destination}`, 3, 600),
    rateLimit(`otp:ip:${input.ip}`, 10, 600),
    rateLimit(`otp:phone-day:${input.phone}`, 12, 86_400),
  ]);
  if (!byPhone || !byDest || !byIp || !byPhoneDaily) {
    throw new OtpError("Too many verification requests. Please wait a few minutes and try again.", 429);
  }

  const brand = { slug: download.brand!.slug, name: download.brand!.name, color: download.brand!.color_primary };
  const fileType = KIND_LABEL[download.kind];

  // Every download is a lead: write the row now so abandoned attempts stay logged as Unverified.
  const lead = await deliverLead({
    formKey: "downloads",
    intent: `${fileType} download`,
    brand,
    sourcePage: input.sourcePage,
    sourceSection: input.sourceSection,
    name: input.name,
    email: input.email,
    phone: input.phone,
    fields: [
      { label: DOWNLOAD_FIELDS[0], value: fileType },
      { label: DOWNLOAD_FIELDS[1], value: download.title },
      { label: DOWNLOAD_FIELDS[2], value: "Yes" },
      { label: DOWNLOAD_FIELDS[3], value: download.requires_otp ? "Unverified" : "Not required" },
    ],
    ack: { kind: "download" },
    sendAcknowledgement: false,
    sendInternalAlert: false,
  });

  const db = createServiceClient();
  const code = randomDigits(6);
  const { data: row, error } = await db
    .from("otp_requests")
    .insert({
      channel: provider.channel,
      destination,
      code_hash: "pending",
      download_id: download.id,
      lead_submission_id: lead.submissionId,
      ip_hash: hmac(`ip:${input.ip}`),
      max_attempts: MAX_ATTEMPTS,
      status: download.requires_otp ? "pending" : "verified",
      verified_at: download.requires_otp ? null : new Date().toISOString(),
      expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString(),
    })
    .select("id")
    .single();
  if (error || !row) throw new OtpError("We couldn't start verification. Please try again.", 500);

  if (!download.requires_otp) {
    const token = await issueReleaseToken(row.id);
    await completeDelivery(download, input, lead.sheetRange, lead.columns, false);
    return { requestId: row.id, channel: provider.channel, maskedDestination: "", resendInSeconds: 0, downloadUrl: `/api/download/${token}` };
  }

  await db.from("otp_requests").update({ code_hash: codeHash(row.id, code) }).eq("id", row.id);
  try {
    await provider.send(destination, { code, minutes: OTP_TTL_MINUTES, purpose: `download the ${download.brand!.name} ${fileType.toLowerCase()}` });
  } catch (err) {
    console.error("[otp] send failed:", err);
    throw new OtpError("We couldn't send the code right now. Please try again shortly.", 502);
  }

  return {
    requestId: row.id,
    channel: provider.channel,
    maskedDestination: maskDestination(destination),
    resendInSeconds: RESEND_COOLDOWN_SECONDS,
  };
}

export async function resendCode(requestId: string, ip: string): Promise<{ resendInSeconds: number }> {
  const db = createServiceClient();
  const { data: req } = await db.from("otp_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req || req.status !== "pending") throw new OtpError("This verification has ended. Please start again.", 410);

  const waited = (Date.now() - new Date(req.last_sent_at).getTime()) / 1000;
  if (waited < RESEND_COOLDOWN_SECONDS) {
    throw new OtpError(`Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - waited)} seconds before requesting a new code.`, 429);
  }
  if (req.send_count >= MAX_SENDS) throw new OtpError("Too many codes requested. Please start again later.", 429);
  if (!(await rateLimit(`otp:ip:${ip}`, 10, 600)) || !(await rateLimit(`otp:dest:${req.destination}`, 3, 600))) {
    throw new OtpError("Too many verification requests. Please wait a few minutes and try again.", 429);
  }

  const download = await loadDownload(req.download_id);
  const code = randomDigits(6);
  await db
    .from("otp_requests")
    .update({
      code_hash: codeHash(req.id, code),
      attempts: 0,
      send_count: req.send_count + 1,
      last_sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString(),
    })
    .eq("id", req.id);
  await getOtpProvider().send(req.destination, {
    code,
    minutes: OTP_TTL_MINUTES,
    purpose: `download the ${download.brand!.name} ${KIND_LABEL[download.kind].toLowerCase()}`,
  });
  return { resendInSeconds: RESEND_COOLDOWN_SECONDS };
}

/** Step 4: verify, release the file, update the sheet, send the emails. */
export async function verifyCode(requestId: string, code: string): Promise<{ downloadUrl: string }> {
  const db = createServiceClient();
  const { data: req } = await db.from("otp_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req) throw new OtpError("This verification was not found. Please start again.", 404);
  if (req.status !== "pending") throw new OtpError("This code has already been used or has expired. Please start again.", 410);

  if (new Date(req.expires_at).getTime() < Date.now()) {
    await db.from("otp_requests").update({ status: "expired" }).eq("id", req.id);
    throw new OtpError("This code has expired. Request a new one.", 410);
  }

  const attempts = req.attempts + 1;
  if (!safeEqual(req.code_hash, codeHash(req.id, code))) {
    const exhausted = attempts >= req.max_attempts;
    await db.from("otp_requests").update({ attempts, status: exhausted ? "failed" : "pending" }).eq("id", req.id);
    throw new OtpError(
      exhausted ? "Too many incorrect attempts. Please start again." : `That code isn't right. ${req.max_attempts - attempts} attempts left.`,
      exhausted ? 410 : 400,
    );
  }

  await db.from("otp_requests").update({ attempts, status: "verified", verified_at: new Date().toISOString() }).eq("id", req.id);
  const token = await issueReleaseToken(req.id);

  // Post-verification side effects must not block the visitor's download: they run after the response.
  after(() => finishVerifiedDownload(req));

  return { downloadUrl: `/api/download/${token}` };
}

/** Updates the lead log + sheet to "Verified" and sends the file email and internal alert. */
async function finishVerifiedDownload(req: Tables<"otp_requests">) {
  const db = createServiceClient();
  try {
    const download = await loadDownload(req.download_id);
    const { data: lead } = req.lead_submission_id
      ? await db.from("lead_submissions").select("sheet_range, email, phone, payload, source_page").eq("id", req.lead_submission_id).maybeSingle()
      : { data: null };
    const payload = (lead?.payload ?? {}) as { name?: string; source_section?: string | null } & Record<string, unknown>;
    // Keep the admin lead log in step with the sheet: this download is now verified.
    if (req.lead_submission_id) {
      await db
        .from("lead_submissions")
        .update({ payload: { ...payload, "OTP status": "Verified" } as { [key: string]: Json | undefined } })
        .eq("id", req.lead_submission_id);
    }
    await completeDelivery(
      download,
      {
        name: payload.name ?? "",
        email: lead?.email ?? "",
        phone: lead?.phone ?? "",
        sourcePage: lead?.source_page ?? "",
        sourceSection: payload.source_section ?? undefined,
      },
      lead?.sheet_range ?? null,
      null,
      true,
    );
  } catch (err) {
    console.error("[otp] post-verification delivery failed:", err);
  }
}

/** Marks the sheet row verified, alerts the team and emails the file to the visitor. */
async function completeDelivery(
  download: DownloadRecord,
  visitor: { name: string; email: string; phone: string; sourcePage: string; sourceSection?: string },
  sheetRange: string | null,
  columns: string[] | null,
  verified: boolean,
) {
  const settings = await getFormSettings("downloads");
  const brand = download.brand!;
  const fileType = KIND_LABEL[download.kind];

  if (verified && sheetRange && settings?.sheet_id) {
    const header = columns ?? leadHeader([...DOWNLOAD_FIELDS]);
    await updateRowCell(settings.sheet_id, sheetRange, header.indexOf("OTP status"), "Verified").catch((err) =>
      console.error("[otp] sheet status update failed:", err),
    );
  }

  const db = createServiceClient();
  const attachments = [];
  if (download.file && download.file.size_bytes <= ATTACH_MAX_BYTES) {
    const { data: blob } = await db.storage.from(download.file.bucket).download(download.file.path);
    if (blob) {
      attachments.push({
        filename: downloadFilename(download.title, download.file.mime_type),
        content: Buffer.from(await blob.arrayBuffer()),
        contentType: download.file.mime_type,
      });
    }
  }

  const to = internalRecipients(settings?.notify_emails ?? []);
  await Promise.allSettled([
    to.length
      ? sendEmail({
          to,
          replyTo: visitor.email,
          email: internalLeadAlert({
            formLabel: "Download",
            brandName: brand.name,
            sourcePage: visitor.sourcePage || "(see sheet)",
            sourceSection: visitor.sourceSection,
            submittedAt: new Date(),
            fields: [
              ["Name", visitor.name],
              ["Email", visitor.email],
              ["Phone", visitor.phone],
              ["File", `${fileType} — ${download.title}`],
              ["OTP status", verified ? "Verified" : "Not required"],
            ],
          }),
        })
      : Promise.resolve(),
    visitor.email
      ? sendEmail({
          to: visitor.email,
          attachments,
          email: acknowledgement({
            kind: "download",
            name: visitor.name || "there",
            subjectTemplate: settings?.ack_subject,
            bodyTemplate: settings?.ack_body,
            brandName: brand.name,
            fileTitle: fileType.toLowerCase(),
            accent: brand.color_primary,
            cta: attachments.length ? undefined : { label: `View the ${fileType.toLowerCase()}`, href: absoluteUrl(`/brands/${brand.slug}#menu`) },
          }),
        })
      : Promise.resolve(),
  ]).then((results) =>
    results.forEach((r) => r.status === "rejected" && console.error("[otp] email failed:", r.reason)),
  );
}

/** Step 5: exchange a one-time release token for a short-lived signed file URL. */
export async function resolveReleaseToken(token: string): Promise<{ url: string } | null> {
  const db = createServiceClient();
  const { data: req } = await db
    .from("otp_requests")
    .select("id, status, release_expires_at, download_id")
    .eq("release_token_hash", hmac(`release:${token}`))
    .maybeSingle();
  if (!req || req.status !== "verified" || !req.release_expires_at || new Date(req.release_expires_at).getTime() < Date.now()) {
    return null;
  }
  const download = await loadDownload(req.download_id);
  const { data } = await db.storage
    .from(download.file!.bucket)
    .createSignedUrl(download.file!.path, 120, { download: downloadFilename(download.title, download.file!.mime_type) });
  return data?.signedUrl ? { url: data.signedUrl } : null;
}
