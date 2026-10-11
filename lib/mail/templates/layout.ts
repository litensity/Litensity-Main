import { readableOn } from "@/lib/color";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Replaces {placeholders} in admin-editable copy with escaped values. */
export function fillTemplate(template: string, values: Record<string, string | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

interface LayoutOptions {
  preheader: string;
  heading: string;
  /** Pre-escaped HTML blocks. */
  body: string;
  accent?: string;
  footer?: string;
}

/** Table-based layout so it renders consistently in Gmail/Outlook. */
export function emailLayout({ preheader, heading, body, accent = "#E0461B", footer }: LayoutOptions): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#F3EEE6;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE6;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FBF8F3;border-radius:6px;overflow:hidden;">
<tr><td style="padding:28px 36px;background:#16110D;color:#F3EEE6;font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:-0.5px;">Litensity<span style="color:${accent}">.</span></td></tr>
<tr><td style="height:4px;background:${accent};line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#16110D;">
<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.15;color:#16110D;">${escapeHtml(heading)}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 36px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#7A6E63;border-top:1px solid #E9E1D5;">${footer ?? "Litensity Food and Beverages Pvt Ltd"}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function paragraph(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function detailsTable(rows: [string, string | number | null | undefined][]): string {
  const cells = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #E9E1D5;color:#7A6E63;vertical-align:top;white-space:nowrap;font-size:13px;">${escapeHtml(k)}</td><td style="padding:10px 0;border-bottom:1px solid #E9E1D5;vertical-align:top;">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 20px;">${cells}</table>`;
}

export function button(label: string, href: string, accent = "#E0461B"): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;background:${accent};color:${readableOn(accent)};text-decoration:none;border-radius:999px;font-weight:bold;">${escapeHtml(label)}</a></p>`;
}
