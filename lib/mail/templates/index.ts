import { button, detailsTable, emailLayout, escapeHtml, fillTemplate, paragraph, type RenderedEmail } from "./layout";

export type { RenderedEmail } from "./layout";

/* --------------------------------------------------------------------------
 * Internal lead alert — one template for every form; the field list varies.
 * -------------------------------------------------------------------------- */
export function internalLeadAlert(input: {
  formLabel: string;
  brandName?: string | null;
  sourcePage: string;
  sourceSection?: string | null;
  fields: [string, string | number | null | undefined][];
  submittedAt: Date;
  extra?: string;
}): RenderedEmail {
  const title = `New ${input.formLabel} lead${input.brandName ? ` — ${input.brandName}` : ""}`;
  const meta: [string, string][] = [
    ["Received", input.submittedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
    ["Source page", input.sourcePage],
  ];
  if (input.sourceSection) meta.push(["Source section", input.sourceSection]);
  if (input.brandName) meta.unshift(["Brand", input.brandName]);
  const html = emailLayout({
    preheader: title,
    heading: title,
    body: `${detailsTable(input.fields)}${detailsTable(meta)}${input.extra ?? ""}`,
    footer: "This lead has also been written to the Google Sheet configured for this form.",
  });
  const text = [title, "", ...[...input.fields, ...meta].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");
  return { subject: title, html, text };
}

/* --------------------------------------------------------------------------
 * Visitor acknowledgements. Copy (subject/body) is editable per form in Admin;
 * {name}, {brand} and {file} placeholders are filled in here.
 * -------------------------------------------------------------------------- */
type AckKind = "enquiry" | "investor" | "franchise" | "career" | "download";

const DEFAULTS: Record<AckKind, { subject: string; body: string }> = {
  enquiry: {
    subject: "We received your message",
    body: "Thank you for writing to Litensity. The right team will get back to you shortly.",
  },
  investor: {
    subject: "Thank you for reaching out to Litensity",
    body: "Thank you for your interest in Litensity. A member of our leadership team will be in touch.",
  },
  franchise: {
    subject: "Thanks for your interest in {brand}",
    body: "Thank you for your interest in partnering with {brand}. Our franchise team will review your details and get in touch shortly.",
  },
  career: {
    subject: "We received your application",
    body: "Thank you for applying to Litensity. Our people team reviews every application and will contact you if there is a match.",
  },
  download: {
    subject: "Your {file} from {brand}",
    body: "Here is the file you requested.",
  },
};

export function acknowledgement(input: {
  kind: AckKind;
  name: string;
  subjectTemplate?: string | null;
  bodyTemplate?: string | null;
  brandName?: string | null;
  fileTitle?: string | null;
  summary?: [string, string | number | null | undefined][];
  cta?: { label: string; href: string };
  accent?: string;
}): RenderedEmail {
  const values = { name: input.name.split(" ")[0], brand: input.brandName ?? "Litensity", file: input.fileTitle ?? "file" };
  const subject = fillTemplate(input.subjectTemplate || DEFAULTS[input.kind].subject, values);
  const bodyText = fillTemplate(input.bodyTemplate || DEFAULTS[input.kind].body, values);
  const greeting = `Hi ${values.name},`;

  const html = emailLayout({
    preheader: bodyText.slice(0, 110),
    heading: subject,
    accent: input.accent,
    body: [
      `<p style="margin:0 0 14px;">${escapeHtml(greeting)}</p>`,
      paragraph(bodyText),
      input.summary?.length
        ? `<p style="margin:20px 0 6px;font-size:13px;color:#7A6E63;">What you shared with us</p>${detailsTable(input.summary)}`
        : "",
      input.cta ? button(input.cta.label, input.cta.href, input.accent) : "",
      `<p style="margin:20px 0 0;">— Team Litensity</p>`,
    ].join(""),
    footer:
      "You are receiving this because you submitted a form on the Litensity website. If this wasn't you, please ignore this email.",
  });

  const text = [greeting, "", bodyText, "", ...(input.cta ? [`${input.cta.label}: ${input.cta.href}`, ""] : []), "— Team Litensity"].join("\n");
  return { subject, html, text };
}

/* --------------------------------------------------------------------------
 * OTP code email (when the OTP channel is email).
 * -------------------------------------------------------------------------- */
export function otpCode(input: { code: string; minutes: number; purpose: string }): RenderedEmail {
  const subject = `${input.code} is your Litensity verification code`;
  const html = emailLayout({
    preheader: `Your code is ${input.code}`,
    heading: "Your verification code",
    body: `<p style="margin:0 0 14px;">Use this code to ${escapeHtml(input.purpose)}:</p>
<p style="margin:18px 0;font-family:'Courier New',monospace;font-size:34px;letter-spacing:10px;font-weight:bold;">${escapeHtml(input.code)}</p>
<p style="margin:0 0 14px;color:#7A6E63;">The code expires in ${input.minutes} minutes. Never share it with anyone.</p>`,
  });
  return {
    subject,
    html,
    text: `Your Litensity verification code is ${input.code}. It expires in ${input.minutes} minutes.`,
  };
}
