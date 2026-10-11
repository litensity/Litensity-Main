import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildMetadata("terms", { title: "Terms", path: "/terms" });
}

export default function Page() {
  return <LegalPage slug="terms" />;
}
