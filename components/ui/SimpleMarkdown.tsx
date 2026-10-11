import Link from "next/link";
import type { ReactNode } from "react";
import { CmsText } from "./CmsText";

/*
 * Minimal, safe Markdown subset for CMS long-form text (legal pages):
 * ## / ### headings, - bullet lists, 1. numbered lists, **bold**, [links](url), paragraphs.
 * Produces React elements only — no HTML injection is possible.
 */

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > last) out.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      out.push(<strong key={`${key}-${i++}`}>{token.slice(2, -2)}</strong>);
    } else {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      const safe = /^(https?:|mailto:|tel:|\/)/.test(href) ? href : "#";
      out.push(
        safe.startsWith("/") ? (
          <Link key={`${key}-${i++}`} href={safe}>
            {label}
          </Link>
        ) : (
          <a key={`${key}-${i++}`} href={safe} rel="noopener noreferrer" target={safe.startsWith("http") ? "_blank" : undefined}>
            {label}
          </a>
        ),
      );
    }
    last = match.index! + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function SimpleMarkdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((block, b) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("### ")) return <h3 key={b}><CmsText value={trimmed.slice(4)} /></h3>;
        if (trimmed.startsWith("## ")) return <h2 key={b}><CmsText value={trimmed.slice(3)} /></h2>;
        const lines = trimmed.split("\n");
        if (lines.every((l) => /^\s*[-*] /.test(l))) {
          return (
            <ul key={b}>
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(/^\s*[-*] /, ""), `${b}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+\. /.test(l))) {
          return (
            <ol key={b}>
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(/^\s*\d+\. /, ""), `${b}-${i}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={b}>{inline(lines.join(" "), String(b))}</p>;
      })}
    </div>
  );
}
