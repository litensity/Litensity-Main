import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";

/** Admin-only: turns on draft mode so unpublished content is visible, then opens the page. */
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return new Response("Not authorised", { status: 401 });
  const path = new URL(request.url).searchParams.get("path") ?? "/";
  // Only same-site relative paths — never an open redirect.
  const safe = path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/";
  (await draftMode()).enable();
  redirect(safe);
}
