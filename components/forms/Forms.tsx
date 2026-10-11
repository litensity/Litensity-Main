import { getFormOptions } from "@/lib/cms/site";
import { getBrands } from "@/lib/cms/brands";
import type { BrandDetail } from "@/lib/cms/types";
import { INTEREST_GROUP, INTEREST_UNSURE, INVESTOR_TYPES } from "@/lib/leads/schemas";
import {
  submitApplication,
  submitFranchiseEnquiry,
  submitGeneralEnquiry,
  submitInvestorEnquiry,
  subscribeNewsletter,
} from "@/app/actions/leads";
import { present } from "@/lib/content";
import { LeadForm } from "./LeadForm";
import type { FieldDef } from "./FormField";

/*
 * Field sets for the six capture points (PRD §15). Option lists come from
 * Admin → Settings → Forms; brand routing and feature checks are enforced server-side.
 */

const contactFields: FieldDef[] = [
  { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" },
  { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel", inputMode: "tel" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", inputMode: "email" },
];

const cleanOptions = (opts: string[]) => opts.map((o) => present(o)).filter((o): o is string => Boolean(o));

/**
 * A dropdown whose options are managed in Admin. Until Litensity supplies them (e.g. unconfirmed budget or
 * ticket-size ranges, which are hidden in production), it falls back to a free-text answer so a required
 * field never blocks submission and no range has to be invented.
 */
function choice(field: FieldDef & { options: string[] }): FieldDef {
  return field.options.length > 0 ? field : { ...field, type: "text", options: undefined };
}

/** BIGGUYS / DCube investment form (brand-routed). Never rendered for brands without the feature. */
export async function FranchiseForm({ brand, tone }: { brand: BrandDetail; tone?: "light" | "dark" }) {
  if (!brand.features.investmentEnquiry) return null;
  const options = await getFormOptions("franchise");
  const formatField: FieldDef =
    brand.investment.field === "preferred_format"
      ? choice({
          name: "preferredFormat",
          label: "Preferred format",
          type: "select",
          required: true,
          options: brand.investment.formatOptions,
        })
      : { name: "preferredLocation", label: "Preferred location", type: "text", placeholder: "Area / mall / high street" };

  return (
    <LeadForm
      action={submitFranchiseEnquiry}
      schema="franchise"
      tone={tone}
      submitLabel="Send enquiry"
      successTitle={`Thanks for your interest in ${brand.name}`}
      hidden={{ brand: brand.slug }}
      fields={[
        ...contactFields,
        { name: "city", label: "City", type: "text", required: true, autoComplete: "address-level2" },
        formatField,
        choice({ name: "budget", label: "Budget range", type: "select", required: true, options: cleanOptions(options.budgetOptions) }),
        choice({ name: "timeline", label: "Timeline", type: "select", required: true, options: cleanOptions(options.timelineOptions) }),
        { name: "message", label: "Message", type: "textarea", full: true },
      ]}
    />
  );
}

export async function InvestorForm({ tone }: { tone?: "light" | "dark" }) {
  const [options, brands] = await Promise.all([getFormOptions("investor"), getBrands()]);
  const interest = [INTEREST_GROUP, ...brands.filter((b) => b.features.investment).map((b) => b.name), INTEREST_UNSURE];
  return (
    <LeadForm
      action={submitInvestorEnquiry}
      schema="investor"
      tone={tone}
      submitLabel="Start the conversation"
      fields={[
        { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" },
        { name: "organisation", label: "Organisation", type: "text", autoComplete: "organization" },
        { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
        { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" },
        { name: "city", label: "City", type: "text", required: true, autoComplete: "address-level2" },
        { name: "interestArea", label: "Interest area", type: "select", required: true, options: interest },
        { name: "investorType", label: "Investor type", type: "select", required: true, options: [...INVESTOR_TYPES] },
        choice({ name: "ticketSize", label: "Indicative ticket size", type: "select", required: true, options: cleanOptions(options.ticketSizeOptions) }),
        choice({ name: "timeline", label: "Timeline", type: "select", required: true, options: cleanOptions(options.timelineOptions) }),
        { name: "message", label: "Message", type: "textarea", full: true },
      ]}
    />
  );
}

/** General + CSR enquiry. `enquiryType` can be fixed (e.g. CSR partnership) or chosen by the visitor. */
export async function GeneralForm({
  tone,
  fixedType,
  brandSlug,
  submitLabel = "Send message",
}: {
  tone?: "light" | "dark";
  fixedType?: string;
  brandSlug?: string;
  submitLabel?: string;
}) {
  const options = await getFormOptions("general");
  const hidden: Record<string, string> = {};
  if (fixedType) hidden.enquiryType = fixedType;
  if (brandSlug) hidden.brand = brandSlug;
  return (
    <LeadForm
      action={submitGeneralEnquiry}
      schema="general"
      tone={tone}
      submitLabel={submitLabel}
      hidden={hidden}
      fields={[
        ...contactFields,
        ...(fixedType
          ? []
          : [{ name: "enquiryType", label: "Enquiry type", type: "select", required: true, options: options.enquiryTypes } satisfies FieldDef]),
        { name: "message", label: "Message", type: "textarea", required: true, full: true },
      ]}
    />
  );
}

export async function CareerForm({
  roles,
  brands,
  jobId,
  role,
  tone,
}: {
  roles: string[];
  brands: { label: string; value: string }[];
  jobId?: string;
  role?: string;
  tone?: "light" | "dark";
}) {
  const hidden: Record<string, string> = {};
  if (jobId) hidden.jobId = jobId;
  if (role) hidden.role = role;
  return (
    <LeadForm
      action={submitApplication}
      schema="career"
      tone={tone}
      submitLabel="Send application"
      hidden={hidden}
      fields={[
        { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" },
        { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
        { name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" },
        ...(role
          ? []
          : [{ name: "role", label: "Role", type: "text", required: true, placeholder: roles[0] ?? "e.g. Store Manager" } satisfies FieldDef]),
        ...(brands.length ? [{ name: "brand", label: "Brand", type: "select", options: brands, placeholder: "Any brand" } satisfies FieldDef] : []),
        { name: "city", label: "Preferred city / location", type: "text", required: true },
        { name: "experience", label: "Years of experience", type: "number", required: true, inputMode: "numeric" },
        { name: "employer", label: "Current employer", type: "text", autoComplete: "organization" },
        {
          name: "resume",
          label: "Resume",
          type: "file",
          accept: ".pdf,.doc,.docx,application/pdf",
          help: "PDF or Word, up to 5 MB — or share a link below.",
        },
        { name: "resumeUrl", label: "Resume link", type: "url", placeholder: "https://" },
        { name: "message", label: "Short message", type: "textarea", full: true },
      ]}
    />
  );
}

export function NewsletterForm() {
  return (
    <LeadForm
      action={subscribeNewsletter}
      schema="newsletter"
      tone="dark"
      compact
      submitLabel="Subscribe"
      fields={[{ name: "email", label: "Email", type: "email", required: true, autoComplete: "email" }]}
    />
  );
}
