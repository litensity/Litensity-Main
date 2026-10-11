import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin/auth";
import { buildLeadExport, parseExportFilter } from "@/lib/leads/export";

/** Streams the lead log as an .xlsx for the filters chosen on /admin/exports. Admins only. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent("/admin/exports" + url.search)}`, url));

  const parsed = parseExportFilter(url.searchParams);
  if (!parsed.success) {
    const back = new URL("/admin/exports", url);
    url.searchParams.forEach((v, k) => back.searchParams.set(k, v));
    return NextResponse.redirect(back);
  }

  try {
    const { file, filename } = await buildLeadExport(parsed.data);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export] lead export failed:", err);
    return NextResponse.redirect(new URL("/admin/exports?error=export-failed", url));
  }
}
