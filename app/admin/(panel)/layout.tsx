import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

/** Every admin page below this layout is gated server-side (plus RLS on every query). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
