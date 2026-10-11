"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section style={{ minHeight: "70svh", display: "grid", alignContent: "center", gap: "1.5rem", padding: "calc(var(--header-h) + 3rem) var(--gutter) 4rem", maxWidth: "var(--max-width)", marginInline: "auto" }}>
      <h1 style={{ fontSize: "var(--fs-2xl)" }}>Something went wrong in the kitchen.</h1>
      <p style={{ maxWidth: "44ch", opacity: 0.75 }}>Please try again. If the problem continues, call or email us — we&apos;re happy to help.</p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </section>
  );
}
