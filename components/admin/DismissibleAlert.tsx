"use client";

import { useState, type ReactNode } from "react";

/**
 * Dashboard alert with a close button. Dismissal is stored in a cookie holding `signature`;
 * the server hides the alert while the cookie matches, so it returns once the signature changes
 * (e.g. another lead fails).
 */
export function DismissibleAlert({ cookie, signature, className, children }: { cookie: string; signature: string; className: string; children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className={`a-alert a-alert-dismissible ${className}`}>
      <div className="a-alert-body">{children}</div>
      <button
        type="button"
        className="a-alert-close"
        aria-label="Dismiss"
        title="Dismiss"
        onClick={() => {
          document.cookie = `${cookie}=${encodeURIComponent(signature)}; path=/admin; max-age=31536000; SameSite=Lax`;
          setHidden(true);
        }}
      >
        ×
      </button>
    </div>
  );
}
