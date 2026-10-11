import { z } from "zod";

/*
 * Centralised validation for every public form. Shared by server actions
 * (authoritative) and client components (instant feedback).
 */

/** Normalises Indian/international numbers to +<digits>. Accepts 10-digit Indian mobiles. */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  const bare = digits.replace(/^\+/, "");
  if (/^[6-9]\d{9}$/.test(bare)) return `+91${bare}`;
  if (/^0[6-9]\d{9}$/.test(bare)) return `+91${bare.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(bare)) return `+${bare}`;
  if (digits.startsWith("+") && /^\d{8,15}$/.test(bare)) return `+${bare}`;
  return null;
}

const name = z.string().trim().min(2, "Please enter your full name").max(100);
const email = z.string().trim().toLowerCase().email("Please enter a valid email address").max(200);
const phone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const n = normalisePhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid mobile number" });
      return z.NEVER;
    }
    return n;
  });
const short = (label: string, max = 120) => z.string().trim().min(1, `Please enter ${label}`).max(max);
const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);
const message = z.string().trim().max(2000).optional().transform((v) => v || undefined);

/** Anti-spam + source capture fields present on every form. */
export const meta = z.object({
  sourcePage: z.string().trim().max(300).default("/"),
  /** Section of the page the form was used from (set by the client from `data-source-section`). */
  sourceSection: z.string().trim().max(120).optional().transform((v) => v || undefined),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
  /** Epoch ms when the form rendered; very fast submissions are rejected as bots. */
  startedAt: z.coerce.number().int().positive(),
});

/** Enquiry types used by fixed-purpose forms; always accepted regardless of the admin list. */
export const RESERVED_ENQUIRY_TYPES = ["CSR partnership"];

export const INVESTOR_TYPES = ["Individual", "Family office", "Institution", "Franchise partner"] as const;
export const INTEREST_GROUP = "Group";
export const INTEREST_UNSURE = "Not sure yet";

export const franchiseSchema = z.object({
  brand: z.string().trim().min(1).max(60),
  name,
  phone,
  email,
  city: short("your city"),
  preferredLocation: optionalText(),
  preferredFormat: optionalText(),
  budget: short("a budget range"),
  timeline: short("a timeline"),
  message,
});

export const investorSchema = z.object({
  name,
  organisation: optionalText(),
  email,
  phone,
  city: short("your city"),
  /** Validated server-side against "Group", investment-enabled brands and "Not sure yet". */
  interestArea: short("an interest area", 60),
  investorType: z.enum(INVESTOR_TYPES, {
    message: "Please choose an investor type",
  }),
  ticketSize: short("an indicative ticket size"),
  timeline: short("a timeline"),
  message,
});

export const generalSchema = z.object({
  name,
  email,
  phone,
  enquiryType: short("an enquiry type", 60),
  brand: optionalText(60),
  message: z.string().trim().min(5, "Please tell us a little more").max(2000),
});

export const careerSchema = z.object({
  name,
  email,
  phone,
  role: short("the role you are applying for"),
  jobId: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  brand: optionalText(60),
  city: short("your preferred city"),
  experience: z.coerce.number({ message: "Please enter years of experience" }).min(0).max(60),
  employer: optionalText(),
  resumeUrl: z
    .string()
    .trim()
    .url("Please enter a valid link")
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  message,
});

export const newsletterSchema = z.object({
  email,
});

export const downloadRequestSchema = z.object({
  downloadId: z.string().uuid(),
  name,
  email,
  phone,
  consent: z.literal("on", { message: "Please accept to continue" }),
});

export const otpVerifySchema = z.object({
  requestId: z.string().uuid(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
}

export const initialFormState: FormState = { status: "idle" };
