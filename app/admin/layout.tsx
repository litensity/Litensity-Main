import type { Metadata } from "next";
import "./admin.css";
import "./builder.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Litensity Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
