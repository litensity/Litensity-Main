import { NextResponse } from "next/server";
import { otpVerifySchema, toFieldErrors } from "@/lib/leads/schemas";
import { OtpError, verifyCode } from "@/lib/otp/service";
import { clientIp, rateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const parsed = otpVerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code", fieldErrors: toFieldErrors(parsed.error) }, { status: 422 });
  }
  if (!(await rateLimit(`otp:verify:ip:${await clientIp()}`, 30, 600))) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  try {
    return NextResponse.json(await verifyCode(parsed.data.requestId, parsed.data.code));
  } catch (err) {
    if (err instanceof OtpError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[otp/verify]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
