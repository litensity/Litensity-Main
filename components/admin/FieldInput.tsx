"use client";

import { useId, useState } from "react";
import type { Field, Option } from "@/lib/admin/types";
import type { MediaThumb } from "@/lib/admin/data";
import { MediaField } from "./MediaField";
import { HoursField } from "./HoursField";

interface Props {
  field: Field;
  value: unknown;
  options: Option[];
  thumb?: MediaThumb;
  error?: string;
  locked?: boolean;
}

const asString = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** One input per field type. Uncontrolled except where live feedback is useful. */
export function FieldInput({ field, value, options, thumb, error, locked }: Props) {
  const id = useId();
  const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field.name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    readOnly: locked,
  } as const;
  const full = field.full || ["textarea", "markdown", "tags", "hours", "media"].includes(field.type);

  let control;
  switch (field.type) {
    case "boolean":
      control = (
        <label className="a-check">
          <input type="checkbox" name={field.name} defaultChecked={Boolean(value)} disabled={locked} aria-describedby={describedBy} />
          <span>{field.label}</span>
        </label>
      );
      break;
    case "textarea":
    case "markdown":
      control = <TextArea common={common} value={asString(value)} tall={field.type === "markdown"} />;
      break;
    case "tags":
      control = <textarea className="a-input" {...common} defaultValue={Array.isArray(value) ? value.join("\n") : asString(value)} rows={4} />;
      break;
    case "select":
    case "relation": {
      const current = typeof value === "boolean" ? String(value) : asString(value);
      control = (
        <select className="a-input" {...common} defaultValue={current} disabled={locked}>
          {!field.required && !options.some((o) => o.value === "") && <option value="">—</option>}
          {field.required && current === "" && (
            <option value="" disabled>
              Select…
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    }
    case "color":
      control = <ColorInput common={common} value={asString(value) || "#E0461B"} />;
      break;
    case "media":
      control = <MediaField name={field.name} accept={field.accept ?? "image"} initial={value ? asString(value) : null} thumb={thumb} locked={locked} />;
      break;
    case "hours":
      control = <HoursField value={Array.isArray(value) ? (value as HoursRow[]) : []} />;
      break;
    case "number":
      control = <input className="a-input" type="number" step="any" {...common} defaultValue={asString(value)} />;
      break;
    case "date":
      control = <input className="a-input" type="date" {...common} defaultValue={asString(value).slice(0, 10)} />;
      break;
    case "time":
      control = <input className="a-input" type="time" {...common} defaultValue={asString(value).slice(0, 5)} />;
      break;
    default:
      control = (
        <input
          className="a-input"
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          {...common}
          defaultValue={asString(value)}
          placeholder={field.placeholder}
        />
      );
  }

  return (
    <div className={`a-field${full ? " a-field-full" : ""}`}>
      {field.type !== "boolean" && (
        <label className="a-label" htmlFor={field.type === "media" || field.type === "hours" ? undefined : id}>
          {field.label}
          {field.required && <span className="a-req"> *</span>}
        </label>
      )}
      {control}
      {field.help && (
        <p id={`${id}-help`} className="a-help">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="a-error">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = Record<string, unknown> & { id: string; name: string };
type HoursRow = { day_of_week: number; opens_at: string | null; closes_at: string | null; is_closed: boolean };

function TextArea({ common, value, tall }: { common: Common; value: string; tall: boolean }) {
  const [length, setLength] = useState(value.length);
  return (
    <>
      <textarea
        className={`a-input${tall ? " a-input-tall" : ""}`}
        {...common}
        defaultValue={value}
        rows={tall ? 18 : 4}
        onChange={(e) => setLength(e.currentTarget.value.length)}
      />
      <span className="a-counter">{length} characters</span>
    </>
  );
}

function ColorInput({ common, value }: { common: Common; value: string }) {
  const [color, setColor] = useState(value);
  return (
    <div className="a-color">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#000000"} onChange={(e) => setColor(e.target.value.toUpperCase())} aria-label="Pick colour" />
      <input className="a-input" {...common} value={color} onChange={(e) => setColor(e.target.value)} maxLength={7} />
    </div>
  );
}
