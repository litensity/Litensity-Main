import "server-only";
import { after } from "next/server";
import type { Json, Tables } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/admin";
import { appendRow, SheetsNotConfiguredError } from "@/lib/sheets/google-sheets";
import { internalRecipients, MailNotConfiguredError, sendEmail, type Attachment } from "@/lib/mail/mailer";
import { acknowledgement, internalLeadAlert } from "@/lib/mail/templates";

/*
 * The single lead pipeline used by every form:
 *   1. log to Supabase (lead_submissions) so nothing is lost if a destination fails
 *   2. append a row to the form's own Google Sheet
 *   3. internal alert to nominated recipients      } sent in parallel after the response
 *   4. acknowledgement to the visitor              } (next/server `after`), so forms answer fast
 * Each destination's outcome is recorded on the log row for audit/retry.
 */

export type FormKey = Tables<"form_settings">["form_key"];

export interface LeadField {
  /** Sheet column header + email label. */
  label: string;
  value: string | number | null | undefined;
}

export interface LeadInput {
  formKey: FormKey;
  /** Shown in alerts; also the "Intent" column. */
  intent: string;
  brand?: { slug: string; name: string; color?: string } | null;
  sourcePage: string;
  sourceSection?: string;
  name: string;
  email: string;
  phone: string;
  fields: LeadField[];
  /** Additional internal recipients (e.g. the department that owns this enquiry type). */
  extraRecipients?: string[];
  ack: {
    kind: "enquiry" | "investor" | "franchise" | "career" | "download";
    fileTitle?: string;
    cta?: { label: string; href: string };
    attachments?: Attachment[];
  };
  /** Extra HTML appended to the internal alert (e.g. an admin-only resume link). */
  internalExtra?: string;
  /** When false the sheet row is written but no visitor acknowledgement is sent (e.g. OTP still pending). */
  sendAcknowledgement?: boolean;
  sendInternalAlert?: boolean;
}

export interface DeliveryResult {
  ok: boolean;
  submissionId: string | null;
  sheetRange: string | null;
  /** Index of each column in the sheet row, for later cell updates. */
  columns: string[];
}

export async function getFormSettings(formKey: FormKey) {
  const db = createServiceClient();
  const { data, error } = await db.from("form_settings").select("*").eq("form_key", formKey).maybeSingle();
  if (error) throw new Error(`form_settings(${formKey}): ${error.message}`);
  return data;
}

/** Sheet header for a form: fixed tagging columns, then the form's own fields. */
export function leadHeader(fieldLabels: string[]): string[] {
  return ["Timestamp", "Intent", "Brand", "Source page", "Source section", "Name", "Email", "Phone", ...fieldLabels];
}

function sheetColumns(input: LeadInput): { header: string[]; row: (string | number | null)[] } {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
  const header = leadHeader(input.fields.map((f) => f.label));
  const row = [
    timestamp,
    input.intent,
    input.brand?.name ?? "",
    input.sourcePage,
    input.sourceSection ?? "",
    input.name,
    input.email,
    input.phone,
    ...input.fields.map((f) => (f.value === undefined || f.value === null ? "" : f.value)),
  ];
  return { header, row };
}

export async function deliverLead(input: LeadInput): Promise<DeliveryResult> {
  const db = createServiceClient();
  const settings = await getFormSettings(input.formKey);
  const { header, row } = sheetColumns(input);

  // 1. Durable log first.
  const payload = Object.fromEntries(input.fields.map((f) => [f.label, f.value ?? null])) as Json;
  const { data: logRow, error: logError } = await db
    .from("lead_submissions")
    .insert({
      form_key: input.formKey,
      brand_slug: input.brand?.slug ?? null,
      source_page: input.sourcePage,
      email: input.email,
      phone: input.phone,
      payload: {
        intent: input.intent,
        name: input.name,
        source_section: input.sourceSection ?? null,
        ...(payload as Record<string, Json>),
      },
    })
    .select("id")
    .single();
  if (logError) console.error("[leads] failed to log submission:", logError.message);
  const submissionId = logRow?.id ?? null;

  // 2. Google Sheet.
  let sheetStatus: "sent" | "failed" | "skipped" = "skipped";
  let sheetRange: string | null = null;
  let sheetError: string | null = null;
  if (settings?.sheet_id) {
    try {
      sheetRange = await appendRow(settings.sheet_id, settings.sheet_tab, header, row);
      sheetStatus = "sent";
    } catch (err) {
      sheetStatus = err instanceof SheetsNotConfiguredError ? "skipped" : "failed";
      sheetError = err instanceof Error ? err.message : String(err);
      console.error(`[leads] sheet ${input.formKey}:`, sheetError);
    }
  } else {
    sheetError = "No sheet configured for this form";
    console.warn(`[leads] ${input.formKey}: no Google Sheet configured — row kept in lead_submissions only.`);
  }

  if (submissionId) {
    await db
      .from("lead_submissions")
      .update({ sheet_status: sheetStatus, sheet_range: sheetRange, sheet_error: sheetError })
      .eq("id", submissionId);
  }

  // 3 + 4. Emails run after the response is sent: the lead is already durable, and SMTP takes seconds.
  // They are independent — one failing must not block the other — and their outcome is logged.
  after(() => sendLeadEmails(input, settings, submissionId));

  // The lead counts as captured if it reached at least one durable destination.
  return { ok: Boolean(submissionId) || sheetStatus === "sent", submissionId, sheetRange, columns: header };
}

async function sendLeadEmails(
  input: LeadInput,
  settings: Awaited<ReturnType<typeof getFormSettings>>,
  submissionId: string | null,
): Promise<void> {
  const fieldRows: [string, string | number | null | undefined][] = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
    ...input.fields.map((f): [string, string | number | null | undefined] => [f.label, f.value]),
  ];
  const sends: { kind: "internal" | "ack"; send: () => Promise<void> }[] = [];

  if (input.sendInternalAlert !== false) {
    const to = internalRecipients([...(settings?.notify_emails ?? []), ...(input.extraRecipients ?? [])]);
    if (to.length > 0) {
      sends.push({
        kind: "internal",
        send: () =>
          sendEmail({
            to,
            replyTo: input.email,
            email: internalLeadAlert({
              formLabel: settings?.label ?? input.intent,
              brandName: input.brand?.name,
              sourcePage: input.sourcePage,
              sourceSection: input.sourceSection,
              fields: fieldRows,
              submittedAt: new Date(),
              extra: input.internalExtra,
            }),
          }),
      });
    }
  }

  if (input.sendAcknowledgement !== false) {
    sends.push({
      kind: "ack",
      send: () =>
        sendEmail({
          to: input.email,
          attachments: input.ack.attachments,
          email: acknowledgement({
            kind: input.ack.kind,
            name: input.name,
            subjectTemplate: settings?.ack_subject,
            bodyTemplate: settings?.ack_body,
            brandName: input.brand?.name,
            fileTitle: input.ack.fileTitle,
            cta: input.ack.cta,
            accent: input.brand?.color,
            summary: input.ack.kind === "download" ? undefined : input.fields.map((f) => [f.label, f.value]),
          }),
        }),
    });
  }

  const results = await Promise.allSettled(sends.map((s) => s.send()));
  const emailErrors = results.flatMap((r, i) =>
    r.status === "rejected" ? [`${sends[i].kind}: ${r.reason instanceof Error ? r.reason.message : r.reason}`] : [],
  );
  if (emailErrors.length) console.error(`[leads] email ${input.formKey}:`, emailErrors.join(" | "));
  const mailSkipped = emailErrors.length > 0 && emailErrors.every((e) => e.includes(new MailNotConfiguredError().message));

  if (submissionId) {
    await createServiceClient()
      .from("lead_submissions")
      .update({
        email_status: sends.length === 0 || mailSkipped ? "skipped" : emailErrors.length ? "failed" : "sent",
        email_error: emailErrors.join(" | ") || null,
      })
      .eq("id", submissionId);
  }
}
