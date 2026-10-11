import type { CSSProperties, ElementType, ReactNode } from "react";
import { MISSING_MARKER, isDev, present } from "@/lib/content";

interface Props {
  text: string | null | undefined;
  as?: ElementType;
  className?: string;
  /** Stagger offset (in steps) so headings can follow other reveals. */
  delay?: number;
  reveal?: boolean;
  /** "words" masks each word (default); "lines" slides each line up in turn (heroes). */
  mode?: "words" | "lines";
  /** Draws a stroke under the *italic* phrase once the lines are in (lines mode). */
  underline?: boolean;
  id?: string;
}

/** Hand-drawn stroke; pathLength=1 lets CSS draw it with a single dash offset. */
function Underline() {
  return (
    <svg className="draw-underline" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M3 11 C 70 4, 170 3, 297 8" pathLength={1} />
    </svg>
  );
}

/**
 * Display heading with a masked reveal.
 * Editors can italicise words with *asterisks* and force a line break with a new line.
 */
export function SplitHeading({ text, as: Tag = "h2", className, delay = 0, reveal = true, mode = "words", underline = false, id }: Props) {
  const value = present(text);
  if (!value) return null;

  if (isDev && value.includes(MISSING_MARKER)) {
    return (
      <Tag className={className} id={id}>
        <span className="cms-missing">{value.replace(MISSING_MARKER, "").trim() || "Heading required"}</span>
      </Tag>
    );
  }

  const lines = value.split(/\n/);
  const label = value.replace(/\*/g, "").replace(/\n/g, " ");
  const chunks = (line: string) =>
    line
      .split(/(\*[^*]+\*)/)
      .filter(Boolean)
      .map((chunk) => ({ italic: chunk.startsWith("*") && chunk.endsWith("*"), text: chunk.replace(/^\*|\*$/g, "") }));

  if (mode === "lines") {
    return (
      <Tag
        className={className}
        id={id}
        data-reveal={reveal ? "lines" : undefined}
        style={{ "--i": delay, "--lines": lines.length } as CSSProperties}
        aria-label={label}
      >
        {lines.map((line, li) => (
          <span key={li} className="split-line" aria-hidden="true" style={{ "--l": li } as CSSProperties}>
            <span>
              {chunks(line).map((c, ci): ReactNode =>
                c.italic ? (
                  <span key={ci} className={underline ? "italic underline-target" : "italic"}>
                    {c.text}
                    {underline && <Underline />}
                  </span>
                ) : (
                  <span key={ci}>{c.text}</span>
                ),
              )}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  let wordIndex = 0;
  return (
    <Tag
      className={className}
      id={id}
      data-reveal={reveal ? "words" : undefined}
      style={{ "--i": delay } as CSSProperties}
      aria-label={label}
    >
      {lines.map((line, li) => (
        <span key={li} aria-hidden="true" style={{ display: "block" }}>
          {chunks(line).flatMap((chunk, ci) =>
            chunk.text
              .split(/\s+/)
              .filter(Boolean)
              .map((word, wi) => {
                const w = wordIndex++;
                return (
                  <span key={`${ci}-${wi}`}>
                    <span className="split-word" style={{ "--w": w } as CSSProperties}>
                      <span className={chunk.italic ? "italic" : undefined}>{word}</span>
                    </span>{" "}
                  </span>
                );
              }),
          )}
        </span>
      ))}
    </Tag>
  );
}
