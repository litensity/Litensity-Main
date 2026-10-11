import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/admin";

/**
 * The Recruitment sheet links here for uploaded resumes. Resumes live in a private
 * bucket; only signed-in admins get a short-lived signed URL.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`, url));
  const path = url.searchParams.get("path") ?? "";
  if (!/^\d{4}-\d{2}\/[0-9a-f-]{36}\.(pdf|docx?)$/.test(path)) return new NextResponse("Not found", { status: 404 });
  const { data } = await createServiceClient().storage.from("resumes").createSignedUrl(path, 60);
  if (!data?.signedUrl) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
