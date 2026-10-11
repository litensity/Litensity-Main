"use client";

import { useCallback, useState } from "react";

export type Toast = { id: number; message: string; tone: "ok" | "error" };

/** Small, non-blocking confirmations for builder actions. */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 3200);
  }, []);
  return { toast, toasts };
}

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="b-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`b-toast b-toast-${t.tone}`}>
          {t.tone === "ok" ? "✓ " : "⚠ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
