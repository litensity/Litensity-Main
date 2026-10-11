"use server";

import { randomUUID } from "node:crypto";
import type { z } from "zod";
import {
  careerSchema,
  franchiseSchema,
  generalSchema,
  INTEREST_GROUP,
  INTEREST_UNSURE,
  investorSchema,
  meta,
  newsletterSchema,
  RESUME_MAX_BYTES,
  RESERVED_ENQUIRY_TYPES,
  RESUME_TYPES,
  toFieldErrors,
  type FormState,
} from "@/lib/leads/schemas";
import { deliverLead, getFormSettings, type LeadField } from "@/lib/leads/deliver";
import { clientIp, looksLikeBot, rateLimit } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/site-url";
import { escapeHtml } from "@/lib/mail/templates/layout";

const GENERIC_ERROR = "Something went wrong on our side. Please try again, or reach us by phone or email.";
const RATE_LIMITED = "You have sent several requests in a short time. Please wait a few minutes and try again.";

function entries(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") out[key] = value;
  });
  return out;
}

/** Shared guard: validates meta + body, applies anti-spam and per-IP limits. */
async function guard<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
  bucket: string,
): Promise<{ ok: true; data: z.infer<T>; sourcePage: string; sourceSection?: string } | { ok: false; state: FormState }> {
  const raw = entries(formData);
  const m = meta.safeParse(raw);
  if (!m.success) {
    console.warn(`[forms] ${bucket}: invalid meta`, m.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; "));
    return { ok: false, state: { status: "error", message: "Please reload the page and try again." } };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, state: { status: "error", message: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) } };
  }

  // Bots get a fake success so they learn nothing.
  if (looksLikeBot(m.data)) return { ok: false, state: { status: "success", message: "Thank you." } };

  const ip = await clientIp();
  if (!(await rateLimit(`form:${bucket}:ip:${ip}`, 6, 600))) {
    return { ok: false, state: { status: "error", message: RATE_LIMITED } };
  }
  return { ok: true, data: parsed.data, sourcePage: m.data.sourcePage, sourceSection: m.data.sourceSection };
}

async function loadBrand(slug: string | undefined) {
  if (!slug) return null;
  const db = createServiceClient();
  const { data } = await db
    .from("brands")
    .select("slug, name, color_primary, feature_investment, feature_investment_enquiry, investment_field")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

/** Emails of departments that own an enquiry type (Admin → Settings → Contact departments). */
async function departmentRecipients(enquiryType: string): Promise<string[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("contact_departments")
    .select("email")
    .eq("status", "published")
    .contains("enquiry_types", [enquiryType]);
  return (data ?? []).flatMap((d) => (d.email ? [d.email] : []));
}

async function successMessage(formKey: Parameters<typeof getFormSettings>[0], fallback: string) {
  const settings = await getFormSettings(formKey).catch(() => null);
  if (settings && !settings.is_enabled) return null;
  return settings?.success_message || fallback;
}

/* ------------------------------------------------------------------------ */

export async function submitFranchiseEnquiry(_: FormState, formData: FormData): Promise<FormState> {
  const g = await guard(formData, franchiseSchema, "franchise");
  if (!g.ok) return g.state;
  const d = g.data;

  // Server-side enforcement of the brand feature matrix (e.g. never for Belgian Waffle).
  const brand = await loadBrand(d.brand);
  if (!brand || !brand.feature_investment || !brand.feature_investment_enquiry) {
    return { status: "error", message: "Investment enquiries are not available for this brand." };
  }

  try {
    const message = await successMessage("franchise", "Thank you — our franchise team will be in touch shortly.");
    if (message === null) return { status: "error", message: "This form is temporarily unavailable." };
    const fields: LeadField[] = [
      { label: "City", value: d.city },
      // Both columns are always written (one stays blank) so BIGGUYS and DCube rows share one
      // column layout in the Franchise Leads sheet.
      { label: "Preferred location", value: brand.investment_field === "preferred_format" ? undefined : d.preferredLocation },
      { label: "Preferred format", value: brand.investment_field === "preferred_format" ? d.preferredFormat : undefined },
      { label: "Budget", value: d.budget },
      { label: "Timeline", value: d.timeline },
      { label: "Message", value: d.message },
    ];
    const result = await deliverLead({
      formKey: "franchise",
      intent: "Franchise / investment",
      brand: { slug: brand.slug, name: brand.name, color: brand.color_primary },
      sourcePage: g.sourcePage,
      sourceSection: g.sourceSection,
      name: d.name,
      email: d.email,
      phone: d.phone,
      fields,
      ack: { kind: "franchise" },
    });
    return result.ok ? { status: "success", message } : { status: "error", message: GENERIC_ERROR };
  } catch (err) {
    console.error("[franchise]", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function submitInvestorEnquiry(_: FormState, formData: FormData): Promise<FormState> {
  const g = await guard(formData, investorSchema, "investor");
  if (!g.ok) return g.state;
  const d = g.data;

  const db = createServiceClient();
  const { data: brands } = await db.from("brands").select("name").eq("status", "published").eq("feature_investment", true);
  const allowed = [INTEREST_GROUP, ...(brands ?? []).map((b) => b.name), INTEREST_UNSURE];
  if (!allowed.includes(d.interestArea)) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: { interestArea: "Please choose an interest area" } };
  }

  try {
    const message = await successMessage("investor", "Thank you — our leadership team will be in touch.");
    if (message === null) return { status: "error", message: "This form is temporarily unavailable." };
    const result = await deliverLead({
      formKey: "investor",
      intent: "Group investor",
      sourcePage: g.sourcePage,
      sourceSection: g.sourceSection,
      name: d.name,
      email: d.email,
      phone: d.phone,
      fields: [
        { label: "Organisation", value: d.organisation },
        { label: "City", value: d.city },
        { label: "Interest area", value: d.interestArea },
        { label: "Investor type", value: d.investorType },
        { label: "Ticket size", value: d.ticketSize },
        { label: "Timeline", value: d.timeline },
        { label: "Message", value: d.message },
      ],
      ack: { kind: "investor" },
    });
    return result.ok ? { status: "success", message } : { status: "error", message: GENERIC_ERROR };
  } catch (err) {
    console.error("[investor]", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function submitGeneralEnquiry(_: FormState, formData: FormData): Promise<FormState> {
  const g = await guard(formData, generalSchema, "general");
  if (!g.ok) return g.state;
  const d = g.data;

  const settings = await getFormSettings("general").catch(() => null);
  if (settings && !settings.is_enabled) return { status: "error", message: "This form is temporarily unavailable." };
  if (settings?.enquiry_types.length && !settings.enquiry_types.includes(d.enquiryType) && !RESERVED_ENQUIRY_TYPES.includes(d.enquiryType)) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: { enquiryType: "Please choose an enquiry type" } };
  }
  const [brand, routed] = await Promise.all([loadBrand(d.brand), departmentRecipients(d.enquiryType)]);

  try {
    const result = await deliverLead({
      formKey: "general",
      extraRecipients: routed,
      intent: d.enquiryType,
      brand: brand ? { slug: brand.slug, name: brand.name, color: brand.color_primary } : null,
      sourcePage: g.sourcePage,
      sourceSection: g.sourceSection,
      name: d.name,
      email: d.email,
      phone: d.phone,
      fields: [
        { label: "Enquiry type", value: d.enquiryType },
        { label: "Message", value: d.message },
      ],
      ack: { kind: "enquiry" },
    });
    return result.ok
      ? { status: "success", message: settings?.success_message || "Message received — we will be in touch." }
      : { status: "error", message: GENERIC_ERROR };
  } catch (err) {
    console.error("[general]", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}

/** Footer updates signup — routed to the General Enquiry sheet as "Newsletter". */
export async function subscribeNewsletter(_: FormState, formData: FormData): Promise<FormState> {
  const g = await guard(formData, newsletterSchema, "newsletter");
  if (!g.ok) return g.state;
  try {
    const result = await deliverLead({
      formKey: "general",
      intent: "Newsletter",
      sourcePage: g.sourcePage,
      sourceSection: g.sourceSection,
      name: "",
      email: g.data.email,
      phone: "",
      fields: [{ label: "Enquiry type", value: "Newsletter" }],
      ack: { kind: "enquiry" },
      sendAcknowledgement: false,
      sendInternalAlert: false,
    });
    return result.ok ? { status: "success", message: "You're on the list." } : { status: "error", message: GENERIC_ERROR };
  } catch (err) {
    console.error("[newsletter]", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}

/* ------------------------------------------------------------------------ */

/** Checks magic bytes so a renamed executable can't pass as a CV. */
function sniffResume(bytes: Uint8Array, mime: string): boolean {
  const head = Array.from(bytes.slice(0, 8));
  if (mime === "application/pdf") return head.slice(0, 4).join() === [0x25, 0x50, 0x44, 0x46].join();
  if (mime === "application/msword") return head.join() === [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].join();
  return head.slice(0, 4).join() === [0x50, 0x4b, 0x03, 0x04].join(); // docx (zip)
}

export async function submitApplication(_: FormState, formData: FormData): Promise<FormState> {
  const g = await guard(formData, careerSchema, "careers");
  if (!g.ok) return g.state;
  const d = g.data;

  const file = formData.get("resume");
  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !d.resumeUrl) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: { resume: "Please upload your resume or share a link" } };
  }

  let resumePath: string | null = null;
  if (hasFile) {
    const ext = RESUME_TYPES[file.type];
    if (!ext) return { status: "error", fieldErrors: { resume: "Please upload a PDF or Word document" }, message: "Please check the highlighted fields." };
    if (file.size > RESUME_MAX_BYTES) return { status: "error", fieldErrors: { resume: "Resume must be 5 MB or smaller" }, message: "Please check the highlighted fields." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!sniffResume(bytes, file.type)) {
      return { status: "error", fieldErrors: { resume: "This file doesn't look like a valid document" }, message: "Please check the highlighted fields." };
    }
    resumePath = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const db = createServiceClient();
    const { error } = await db.storage.from("resumes").upload(resumePath, bytes, { contentType: file.type, upsert: false });
    if (error) {
      console.error("[careers] resume upload failed:", error.message);
      return { status: "error", message: "We couldn't upload your resume. Please try again or share a link instead." };
    }
  }

  const db = createServiceClient();
  const [{ data: job }, brand] = await Promise.all([
    d.jobId ? db.from("jobs").select("title").eq("id", d.jobId).maybeSingle() : Promise.resolve({ data: null }),
    loadBrand(d.brand),
  ]);

  // Private file: the sheet links to an admin-only endpoint that issues a short-lived signed URL.
  const resumeLink = resumePath ? absoluteUrl(`/admin/resumes?path=${encodeURIComponent(resumePath)}`) : d.resumeUrl;

  try {
    const message = await successMessage("recruitment", "Application received — thank you.");
    if (message === null) return { status: "error", message: "Applications are temporarily closed." };
    const result = await deliverLead({
      formKey: "recruitment",
      intent: job ? "Job application" : "General application",
      brand: brand ? { slug: brand.slug, name: brand.name, color: brand.color_primary } : null,
      sourcePage: g.sourcePage,
      sourceSection: g.sourceSection,
      name: d.name,
      email: d.email,
      phone: d.phone,
      fields: [
        { label: "Role", value: job?.title ?? d.role },
        { label: "Preferred city", value: d.city },
        { label: "Experience (years)", value: d.experience },
        { label: "Current employer", value: d.employer },
        { label: "Resume", value: resumeLink },
        { label: "Message", value: d.message },
      ],
      ack: { kind: "career" },
      internalExtra: resumeLink
        ? `<p style="margin:0;"><a href="${escapeHtml(resumeLink)}">Open resume</a> (admin sign-in required for uploaded files)</p>`
        : undefined,
    });
    return result.ok ? { status: "success", message } : { status: "error", message: GENERIC_ERROR };
  } catch (err) {
    console.error("[careers]", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}
