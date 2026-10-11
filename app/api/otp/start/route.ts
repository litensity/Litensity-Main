import { NextResponse } from "next/server";
import { downloadRequestSchema, toFieldErrors } from "@/lib/leads/schemas";
import { OtpError, startDownload } from "@/lib/otp/service";
import { clientIp, looksLikeBot } from "@/lib/security";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const parsed = downloadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) }, { status: 422 });
  }
  if (looksLikeBot({ website: String(body.website ?? ""), startedAt: Number(body.startedAt ?? 0) })) {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }

  try {
    const result = await startDownload({
      ...parsed.data,
      ip: await clientIp(),
      sourcePage: String(body.sourcePage ?? "").slice(0, 300) || "/",
      sourceSection: String(body.sourceSection ?? "").slice(0, 120) || undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof OtpError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[otp/start]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
