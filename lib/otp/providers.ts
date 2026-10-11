import "server-only";
import { serverEnv } from "@/lib/env";
import { sendEmail } from "@/lib/mail/mailer";
import { otpCode } from "@/lib/mail/templates";

/*
 * OTP delivery is provider-agnostic. The channel (email / SMS) is chosen by
 * OTP_CHANNEL; adding an SMS vendor means implementing `OtpProvider` below —
 * nothing else in the app changes.
 */

export interface OtpMessage {
  code: string;
  minutes: number;
  purpose: string;
}

export interface OtpProvider {
  channel: "email" | "sms";
  /** Picks the destination from the visitor's details. */
  destination(contact: { email: string; phone: string }): string;
  send(destination: string, message: OtpMessage): Promise<void>;
}

const emailProvider: OtpProvider = {
  channel: "email",
  destination: ({ email }) => email,
  async send(to, message) {
    await sendEmail({ to, email: otpCode(message) });
  },
};

/**
 * SMS provider slot. Litensity has not chosen an SMS vendor yet (PRD §21).
 * Implement `send` with the chosen vendor's API (DLT-registered template in India).
 */
const smsProvider: OtpProvider = {
  channel: "sms",
  destination: ({ phone }) => phone,
  async send() {
    throw new Error("SMS OTP provider is not configured. Set OTP_CHANNEL=email or implement lib/otp/providers.ts#smsProvider.");
  },
};

export function getOtpProvider(): OtpProvider {
  const base = serverEnv.otpChannel === "sms" ? smsProvider : emailProvider;
  if (!serverEnv.otpDevLog) return base;
  // Local development: print the code instead of sending it.
  return {
    ...base,
    async send(destination, message) {
      console.info(`\n[otp:dev] ${base.channel} → ${destination}: ${message.code}\n`);
    },
  };
}

export function maskDestination(destination: string): string {
  if (destination.includes("@")) {
    const [user, domain] = destination.split("@");
    return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
  }
  return `${destination.slice(0, 3)} ••••• ${destination.slice(-3)}`;
}
