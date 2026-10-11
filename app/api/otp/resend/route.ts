import { NextResponse } from "next/server";
import { z } from "zod";
import { OtpError, resendCode } from "@/lib/otp/service";
import { clientIp } from "@/lib/security";

export async function POST(request: Request) {
  const parsed = z.object({ requestId: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    return NextResponse.json(await resendCode(parsed.data.requestId, await clientIp()));
  } catch (err) {
    if (err instanceof OtpError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[otp/resend]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
