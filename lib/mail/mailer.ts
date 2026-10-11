import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "@/lib/env";
import type { RenderedEmail } from "./templates/layout";

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
  await transport.sendMail({
    from: smtp.from,
    to: recipients,
    replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments,
  });
}

/** Internal recipients for a form: nominated list from Admin, else the env fallback. */
export function internalRecipients(nominated: string[]): string[] {
  const list = [...new Set(nominated.map((e) => e.trim().toLowerCase()).filter((e) => /\S+@\S+\.\S+/.test(e)))];
  if (list.length > 0) return list;
  const fallback = serverEnv.smtp?.fallbackTo;
  return fallback ? [fallback] : [];
}
