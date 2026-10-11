import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "@/lib/env";
import { LOGO_CID, type RenderedEmail } from "./templates/layout";

/** Embedded (cid:) rather than linked, so the logo shows in every inbox regardless of where the site is hosted. */
let logo: Buffer | null = null;
function logoAttachment() {
  logo ??= readFileSync(path.join(process.cwd(), "lib/mail/assets/litensity-logo.png"));
  return { filename: "litensity-logo.png", content: logo, contentType: "image/png", cid: LOGO_CID, contentDisposition: "inline" as const };
}

/*
 * The only place Nodemailer is configured. Every email in the app goes through
 * `sendEmail` so transport, sender and error handling are consistent.
 */

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  const smtp = serverEnv.smtp;
  if (!smtp) return null;
  transporter ??= nodemailer.createTransport({
    // Pooled: reuse authenticated connections. A fresh SMTP login costs ~2.5 s per email.
    pool: true,
    maxConnections: 3,
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });
  return transporter;
}

export interface Attachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendOptions {
  to: string | string[];
  email: RenderedEmail;
  replyTo?: string;
  attachments?: Attachment[];
}

export class MailNotConfiguredError extends Error {
  constructor() {
    super("SMTP is not configured");
  }
}

export async function sendEmail({ to, email, replyTo, attachments }: SendOptions): Promise<void> {
  const transport = getTransport();
  const smtp = serverEnv.smtp;
  if (!transport || !smtp) throw new MailNotConfiguredError();
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (recipients.length === 0) throw new Error("No email recipients");
  const message = {
    from: smtp.from,
    to: recipients,
    replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: email.html.includes(`cid:${LOGO_CID}`) ? [logoAttachment(), ...(attachments ?? [])] : attachments,
  };
  try {
    await transport.sendMail(message);
  } catch (err) {
    // A pooled connection left idle can be closed by the server; the pool then opens a fresh one.
    if (!isDroppedConnection(err)) throw err;
    await transport.sendMail(message);
  }
}

function isDroppedConnection(err: unknown): boolean {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  return ["ECONNRESET", "EPIPE", "ETIMEDOUT", "ESOCKET", "ECONNECTION"].includes(code ?? "") || /ECONNRESET|EPIPE|socket hang up|connection closed/i.test(message ?? "");
}

/** Internal recipients for a form: nominated list from Admin, else the env fallback. */
export function internalRecipients(nominated: string[]): string[] {
  const list = [...new Set(nominated.map((e) => e.trim().toLowerCase()).filter((e) => /\S+@\S+\.\S+/.test(e)))];
  if (list.length > 0) return list;
  const fallback = serverEnv.smtp?.fallbackTo;
  return fallback ? [fallback] : [];
}
