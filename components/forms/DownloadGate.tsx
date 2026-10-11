"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { downloadRequestSchema, toFieldErrors, type FieldErrors } from "@/lib/leads/schemas";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormField } from "./FormField";
import { sourceSectionOf } from "./source";
import styles from "./DownloadGate.module.css";
import formStyles from "./LeadForm.module.css";

interface Props {
  downloadId: string;
  title: string;
  brandName: string;
  kindLabel: string;
  /** Anchor of the on-page menu so abandoning OTP never dead-ends the visitor. */
  onPageHref?: string;
  triggerClassName?: string;
  triggerLabel?: string;
  /** Consent wording from Admin → Settings → Forms → Downloads. */
  consentLabel: string;
}

type Step =
  | { name: "details" }
  | { name: "code"; requestId: string; masked: string; channel: "email" | "sms" }
  | { name: "done"; url: string };

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; fieldErrors?: FieldErrors }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Something went wrong.", fieldErrors: json.fieldErrors };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "You appear to be offline. Please check your connection." };
  }
}

/** Gated download: details + consent → OTP → file (PRD §9). Rendered through the server `DownloadGate` wrapper. */
export function DownloadGateClient({ downloadId, title, brandName, kindLabel, onPageHref, triggerClassName, triggerLabel, consentLabel }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ name: "details" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const startedAt = useRef(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sourceSection = useRef("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step.name === "code") codeRef.current?.focus();
    if (step.name === "done") window.location.assign(step.url);
  }, [step]);

  function openGate() {
    startedAt.current = Date.now();
    sourceSection.current = sourceSectionOf(triggerRef.current);
    setStep({ name: "details" });
    setErrors({});
    setMessage(null);
    setOpen(true);
  }

  async function submitDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const parsed = downloadRequestSchema.safeParse({ ...raw, downloadId });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setErrors({});
    setMessage(null);
    const res = await post<{ requestId: string; maskedDestination: string; channel: "email" | "sms"; resendInSeconds: number; downloadUrl?: string }>(
      "/api/otp/start",
      { ...raw, downloadId, sourcePage: pathname, sourceSection: sourceSection.current, startedAt: startedAt.current },
    );
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      setMessage(res.error);
      return;
    }
    if (res.data.downloadUrl) {
      setStep({ name: "done", url: res.data.downloadUrl });
      return;
    }
    setCooldown(res.data.resendInSeconds);
    setStep({ name: "code", requestId: res.data.requestId, masked: res.data.maskedDestination, channel: res.data.channel });
  }

  async function submitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step.name !== "code") return;
    const code = String(new FormData(e.currentTarget).get("code") ?? "").replace(/\D/g, "");
    if (code.length !== 6) {
      setMessage("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await post<{ downloadUrl: string }>("/api/otp/verify", { requestId: step.requestId, code });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.error);
      if (/start again/i.test(res.error)) setStep({ name: "details" });
      return;
    }
    setStep({ name: "done", url: res.data.downloadUrl });
  }

  async function resend() {
    if (step.name !== "code" || cooldown > 0) return;
    setBusy(true);
    setMessage(null);
    const res = await post<{ resendInSeconds: number }>("/api/otp/resend", { requestId: step.requestId });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.error);
      return;
    }
    setCooldown(res.data.resendInSeconds);
    setMessage("A new code is on its way.");
  }

  return (
    <>
      <button ref={triggerRef} type="button" className={triggerClassName ?? styles.trigger} onClick={openGate}>
        <span>{triggerLabel ?? `Download ${kindLabel.toLowerCase()}`}</span>
        <Icon name="download" size={18} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <ol className={styles.steps} aria-label="Progress">
          {["Your details", "Verify", "Download"].map((label, i) => {
            const index = step.name === "details" ? 0 : step.name === "code" ? 1 : 2;
            return (
              <li key={label} data-state={i < index ? "done" : i === index ? "current" : "todo"} aria-current={i === index ? "step" : undefined}>
                {label}
              </li>
            );
          })}
        </ol>

        {message && (
          <p role="alert" className={formStyles.alert}>
            {message}
          </p>
        )}

        {step.name === "details" && (
          <form onSubmit={submitDetails} noValidate className={styles.form}>
            <p className={styles.lede}>
              Share your details and we&apos;ll verify them with a one-time code before the {brandName}{" "}
              {kindLabel.toLowerCase()} downloads. We&apos;ll also email you a copy.
            </p>
            <div className={styles.fields}>
              <FormField field={{ name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" }} error={errors.name} />
              <FormField field={{ name: "email", label: "Email", type: "email", required: true, autoComplete: "email" }} error={errors.email} />
              <FormField field={{ name: "phone", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" }} error={errors.phone} />
              <FormField
                field={{ name: "consent", label: consentLabel, type: "checkbox", required: true }}
                error={errors.consent}
              />
            </div>
            <div className={formStyles.trap} aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>
            <div className={styles.actions}>
              <Button type="submit" disabled={busy}>
                {busy ? "Sending code…" : "Send code"}
              </Button>
              <p className={styles.small}>
                <Link href="/privacy" target="_blank">
                  Privacy Policy
                </Link>{" "}
                ·{" "}
                <Link href="/terms" target="_blank">
                  Terms
                </Link>
              </p>
            </div>
          </form>
        )}

        {step.name === "code" && (
          <form onSubmit={submitCode} noValidate className={styles.form}>
            <p className={styles.lede}>
              We sent a 6-digit code {step.channel === "email" ? "to" : "by SMS to"} <strong>{step.masked}</strong>. It expires in 10 minutes.
            </p>
            <label className={styles.codeLabel} htmlFor="otp-code">
              Verification code
            </label>
            <input
              ref={codeRef}
              id="otp-code"
              name="code"
              className={styles.code}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="••••••"
              required
            />
            <div className={styles.actions}>
              <Button type="submit" disabled={busy}>
                {busy ? "Verifying…" : "Verify & download"}
              </Button>
              <button type="button" className={styles.resend} onClick={resend} disabled={busy || cooldown > 0}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {step.name === "done" && (
          <div className={styles.done} role="status">
            <span className={styles.doneIcon}>
              <Icon name="download" size={26} />
            </span>
            <p className={styles.lede}>Verified — your download is starting. A copy is on its way to your inbox.</p>
            <a href={step.url} className={styles.resend}>
              Download didn&apos;t start? Click here
            </a>
          </div>
        )}

        {onPageHref && step.name !== "done" && (
          <p className={styles.escape}>
            Just browsing?{" "}
            <a href={onPageHref} onClick={() => setOpen(false)}>
              View the menu on this page
            </a>
          </p>
        )}
      </Modal>
    </>
  );
}
