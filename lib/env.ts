import "server-only";

/** Server-side environment access. Throws early with a clear message when a value is missing. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value ? value : undefined;
}

export const serverEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get appSecret() {
    return required("APP_SECRET");
  },
  get google() {
    const email = optional("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const key = optional("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
    return email && key ? { email, privateKey: key.replace(/\\n/g, "\n") } : null;
  },
  get smtp() {
    const host = optional("SMTP_HOST");
    if (!host) return null;
    return {
      host,
      port: Number(optional("SMTP_PORT") ?? 587),
      secure: optional("SMTP_SECURE") === "true",
      user: optional("SMTP_USER"),
      password: optional("SMTP_PASSWORD"),
      from: optional("MAIL_FROM") ?? "Litensity <no-reply@localhost>",
      fallbackTo: optional("MAIL_FALLBACK_TO"),
    };
  },
  get otpChannel(): "email" | "sms" {
    return optional("OTP_CHANNEL") === "sms" ? "sms" : "email";
  },
  get otpDevLog() {
    return process.env.NODE_ENV !== "production" && optional("OTP_DEV_LOG") === "true";
  },
};
