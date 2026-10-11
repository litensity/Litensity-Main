import "server-only";
import { z } from "zod";
import type { Tables } from "@/types/database";
import { createSessionClient } from "@/lib/supabase/server";
import { buildXlsx, type XlsxCell, type XlsxColumn, type XlsxSheet } from "@/lib/xlsx/workbook";
import { leadHeader, type FormKey } from "./deliver";

/*
 * Excel export of the lead log (lead_submissions). Reads with the signed-in admin's session,
 * so the database's admin-only RLS policy is the final gate. One worksheet per form, laid out
 * like that form's Google Sheet, plus the delivery status of each lead.
 */

/** Sheet order in an "all forms" workbook. */
export const EXPORT_FORMS = ["franchise", "downloads", "investor", "recruitment", "general"] as const satisfies readonly FormKey[];

/**
 * Column order of each form's own fields (jsonb doesn't keep key order). Mirrors the field
 * lists in app/actions/leads.ts and lib/otp/service.ts; any field not listed here is still
 * exported, after these.
 */
const FIELD_ORDER: Record<FormKey, string[]> = {
  franchise: ["City", "Preferred location", "Preferred format", "Budget", "Timeline", "Message"],
  downloads: ["File type", "File", "Consent", "OTP status"],
  investor: ["Organisation", "City", "Interest area", "Investor type", "Ticket size", "Timeline", "Message"],
  recruitment: ["Role", "Preferred city", "Experience (years)", "Current employer", "Resume", "Message"],
  general: ["Enquiry type", "Message"],
};
const WRAPPED = new Set(["Message"]);
const LINKED: Record<string, string> = { Resume: "Open resume" };
/** Payload keys that already have a fixed column. */
const BUILT_IN = new Set(["intent", "name", "source_section"]);

const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v), "Invalid date");

const filterSchema = z
  .object({
    form: z.enum(["all", ...EXPORT_FORMS]).default("all"),
    brand: z.string().regex(/^[a-z0-9-]*$/).default(""),
    from: z.union([isoDay, z.literal("")]).default(""),
    to: z.union([isoDay, z.literal("")]).default(""),
  })
  .refine((f) => !f.from || !f.to || f.from <= f.to, { message: "The start date must be on or before the end date.", path: ["to"] });

export type LeadExportFilter = z.infer<typeof filterSchema>;

export function parseExportFilter(params: URLSearchParams | Record<string, string | string[] | undefined>) {
  const get = (key: string) => {
    const v = params instanceof URLSearchParams ? params.get(key) : params[key];
    return (Array.isArray(v) ? v[0] : v) ?? undefined;
  };
  return filterSchema.safeParse({ form: get("form") || undefined, brand: get("brand"), from: get("from"), to: get("to") });
}

export function filterForms(filter: LeadExportFilter): FormKey[] {
  return filter.form === "all" ? [...EXPORT_FORMS] : [filter.form];
}

/** Dates are picked as Indian calendar days: from 00:00 IST on `from` to the end of `to`. */
function dayStartIst(day: string): string {
  return `${day}T00:00:00+05:30`;
}
function nextDayStartIst(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return dayStartIst(d.toISOString().slice(0, 10));
}

type LeadRow = Pick<Tables<"lead_submissions">, "created_at" | "form_key" | "brand_slug" | "source_page" | "email" | "phone" | "payload" | "sheet_status" | "email_status">;

type Db = Awaited<ReturnType<typeof createSessionClient>>;

function scoped(db: Db, filter: LeadExportFilter, forms: FormKey[], columns: string, head = false) {
  let query = db.from("lead_submissions").select(columns, head ? { count: "exact", head: true } : undefined).in("form_key", forms);
  if (filter.brand) query = query.eq("brand_slug", filter.brand);
  if (filter.from) query = query.gte("created_at", dayStartIst(filter.from));
  if (filter.to) query = query.lt("created_at", nextDayStartIst(filter.to));
  return query;
}

/** Lead counts per form for the chosen filters (shown before downloading). */
export async function countLeads(filter: LeadExportFilter): Promise<Record<FormKey, number>> {
  const db = await createSessionClient();
  const entries = await Promise.all(
    EXPORT_FORMS.map(async (form) => {
      const { count, error } = await scoped(db, filter, [form], "id", true);
      if (error) throw new Error(`Counting ${form} leads failed: ${error.message}`);
      return [form, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<FormKey, number>;
}

const PAGE = 1000; // PostgREST's default max rows per request

async function fetchLeads(db: Db, filter: LeadExportFilter, forms: FormKey[]): Promise<LeadRow[]> {
  const rows: LeadRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await scoped(db, filter, forms, "created_at, form_key, brand_slug, source_page, email, phone, payload, sheet_status, email_status")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1)
      .returns<LeadRow[]>();
    if (error) throw new Error(`Loading leads failed: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

const STATUS_LABEL: Record<string, string> = { sent: "Sent", failed: "Failed", skipped: "Not configured", pending: "Pending" };

function text(value: unknown): XlsxCell {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function formSheet(form: FormKey, label: string, rows: LeadRow[], brandNames: Map<string, string>): XlsxSheet {
  const payloads = rows.map((r) => (r.payload && typeof r.payload === "object" && !Array.isArray(r.payload) ? r.payload : {}) as Record<string, unknown>);
  const known = new Set(FIELD_ORDER[form]);
  const extra = [...new Set(payloads.flatMap((p) => Object.keys(p)))].filter((k) => !known.has(k) && !BUILT_IN.has(k)).sort();
  const fields = [...FIELD_ORDER[form], ...extra];

  const header = leadHeader(fields);
  header[0] = "Submitted (IST)";
  const columns: XlsxColumn[] = [...header, "Sheet delivery", "Email delivery"].map((h) => ({ header: h, wrap: WRAPPED.has(h) }));

  return {
    name: label,
    columns,
    rows: rows.map((r, i) => {
      const p = payloads[i];
      return [
        { date: new Date(r.created_at) },
        text(p.intent),
        r.brand_slug ? (brandNames.get(r.brand_slug) ?? r.brand_slug) : null,
        r.source_page,
        text(p.source_section),
        text(p.name),
        r.email,
        r.phone,
        ...fields.map((f): XlsxCell => {
          const value = p[f];
          return LINKED[f] && typeof value === "string" && value ? { link: value, text: LINKED[f] } : text(value);
        }),
        STATUS_LABEL[r.sheet_status] ?? r.sheet_status,
        STATUS_LABEL[r.email_status] ?? r.email_status,
      ];
    }),
  };
}

export async function buildLeadExport(filter: LeadExportFilter): Promise<{ file: Buffer; filename: string; rows: number }> {
  const db = await createSessionClient();
  const forms = filterForms(filter);
  const [leads, { data: brands }, { data: settings }] = await Promise.all([
    fetchLeads(db, filter, forms),
    db.from("brands").select("slug, name"),
    db.from("form_settings").select("form_key, label"),
  ]);
  const brandNames = new Map((brands ?? []).map((b) => [b.slug, b.name]));
  const labels = new Map((settings ?? []).map((s) => [s.form_key, s.label]));

  const sheets = forms.map((form) =>
    formSheet(
      form,
      labels.get(form) ?? form,
      leads.filter((l) => l.form_key === form),
      brandNames,
    ),
  );

  const today = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
  const parts = ["litensity-leads", filter.form === "all" ? "all-forms" : filter.form, filter.brand, `${filter.from || "start"}-to-${filter.to || today}`];
  return { file: buildXlsx(sheets), filename: `${parts.filter(Boolean).join("_")}.xlsx`, rows: leads.length };
}
