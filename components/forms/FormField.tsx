"use client";

import { useId, useState } from "react";
import styles from "./LeadForm.module.css";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "url" | "select" | "textarea" | "file" | "checkbox";
  required?: boolean;
  options?: (string | { label: string; value: string })[];
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text" | "url";
  /** Full-width row on wide layouts. */
  full?: boolean;
  accept?: string;
  help?: string;
  defaultValue?: string;
}

/** Accessible field: visible label, required marker, described-by help + error. */
export function FormField({ field, error }: { field: FieldDef; error?: string }) {
  const id = useId();
  const helpId = field.help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const [fileName, setFileName] = useState<string | null>(null);

  const common = {
    id,
    name: field.name,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;

  if (field.type === "checkbox") {
    return (
      <div className={`${styles.field} ${styles.full}`}>
        <label className={styles.checkbox} htmlFor={id}>
          <input type="checkbox" {...common} />
          <span>
            {field.label}
            {field.required && <span className={styles.req}> *</span>}
          </span>
        </label>
        {error && (
          <p id={errorId} className={styles.error}>
            {error}
          </p>
        )}
      </div>
    );
  }

  let control;
  if (field.type === "select") {
    control = (
      <select {...common} defaultValue={field.defaultValue ?? ""} className={styles.control}>
        <option value="" disabled>
          {field.placeholder ?? "Select"}
        </option>
        {field.options?.map((o) => {
          const { label, value } = typeof o === "string" ? { label: o, value: o } : o;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea {...common} rows={4} placeholder={field.placeholder} defaultValue={field.defaultValue} className={styles.control} />
    );
  } else if (field.type === "file") {
    control = (
      <label className={styles.file} htmlFor={id}>
        <input
          type="file"
          {...common}
          accept={field.accept}
          onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
        />
        <span className={styles.fileButton}>Choose file</span>
        <span className={styles.fileName}>{fileName ?? "No file selected"}</span>
      </label>
    );
  } else {
    control = (
      <input
        type={field.type}
        {...common}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
        inputMode={field.inputMode}
        defaultValue={field.defaultValue}
        className={styles.control}
      />
    );
  }

  return (
    <div className={`${styles.field} ${field.full ? styles.full : ""}`}>
      <label htmlFor={field.type === "file" ? undefined : id} className={styles.label} id={`${id}-label`}>
        {field.label}
        {field.required && <span className={styles.req}> *</span>}
      </label>
      {control}
      {field.help && (
        <p id={helpId} className={styles.help}>
          {field.help}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
