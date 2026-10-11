import { NextResponse } from "next/server";
import { resolveReleaseToken } from "@/lib/otp/service";

/** Releases a gated file after OTP verification via a 2-minute signed URL. */
export async function GET(request: Request, ctx: RouteContext<"/api/download/[token]">) {
  const { token } = await ctx.params;
  if (!/^[\w-]{20,100}$/.test(token)) return new NextResponse("Not found", { status: 404 });
  const release = await resolveReleaseToken(token).catch(() => null);
  if (!release) {
    return new NextResponse("This download link has expired. Please request the file again.", {
      status: 410,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.redirect(release.url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
