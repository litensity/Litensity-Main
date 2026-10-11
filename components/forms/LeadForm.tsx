"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import {
  careerSchema,
  franchiseSchema,
  generalSchema,
  initialFormState,
  investorSchema,
  newsletterSchema,
  toFieldErrors,
  type FieldErrors,
  type FormState,
} from "@/lib/leads/schemas";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormField, type FieldDef } from "./FormField";
import { sourceSectionOf } from "./source";
import styles from "./LeadForm.module.css";

const SCHEMAS = {
  franchise: franchiseSchema,
  investor: investorSchema,
  general: generalSchema,
  career: careerSchema,
  newsletter: newsletterSchema,
} as const;

export type SchemaKey = keyof typeof SCHEMAS;

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  schema: SchemaKey;
  fields: FieldDef[];
  submitLabel: string;
  /** Values captured automatically (brand, job, enquiry type…). */
  hidden?: Record<string, string>;
  tone?: "light" | "dark";
  /** Show the privacy/terms note. The PRD requires it on every form, so only disable it with a reason. */
  legal?: boolean;
  compact?: boolean;
  successTitle?: string;
}

/** One form engine for every capture point: validation, anti-spam, source capture, a11y. */
export function LeadForm({
  action,
  schema,
  fields,
  submitLabel,
  hidden = {},
  tone = "light",
  legal = true,
  compact = false,
  successTitle = "Thank you",
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  // Mount time for the bot timing check (client only, so SSR stays deterministic).
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const errors = { ...state.fieldErrors, ...clientErrors };

  useEffect(() => {
    if (state.status === "error") alertRef.current?.focus();
  }, [state]);

  // Dispatched manually (not via the form `action` prop) so React does not reset
  // the visitor's input when the server returns a validation error.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("startedAt", String(startedAt.current));
    formData.set("sourceSection", sourceSectionOf(event.currentTarget));
    const result = SCHEMAS[schema].safeParse(Object.fromEntries(formData.entries()));
    if (!result.success) {
      const errs = toFieldErrors(result.error);
      setClientErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setClientErrors({});
    startTransition(() => formAction(formData));
  }

  if (state.status === "success") {
    return (
      <div className={`${styles.success} ${styles[tone]}`} role="status">
        <span className={styles.successIcon}>
          <Icon name="sparkle" size={28} />
        </span>
        {!compact && <p className={styles.successTitle}>{successTitle}</p>}
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={`${styles.form} ${styles[tone]} ${compact ? styles.compact : ""}`}
      aria-busy={pending}
    >
      {state.status === "error" && state.message && (
        <div ref={alertRef} tabIndex={-1} role="alert" className={styles.alert}>
          {state.message}
        </div>
      )}

      <div className={styles.grid}>
        {fields.map((field) => (
          <FormField key={field.name} field={field} error={errors[field.name]} />
        ))}
      </div>

      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input type="hidden" name="sourcePage" value={pathname} />
      <div className={styles.trap} aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className={styles.footer}>
        <Button type="submit" tone={tone === "dark" ? "paper" : "ink"} size={compact ? "md" : "lg"} disabled={pending}>
          {pending ? "Sending…" : submitLabel}
        </Button>
        {legal && (
          <p className={styles.legal}>
            By submitting you agree to our <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/terms">Terms</Link>. Fields marked * are required.
          </p>
        )}
      </div>
    </form>
  );
}
