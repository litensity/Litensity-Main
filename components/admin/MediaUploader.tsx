"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadFile } from "./upload";

/** Drag-and-drop multi-file uploader for the media library. */
export function MediaUploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setErrors([]);
    setProgress({ done: 0, total: list.length });
    const failed: string[] = [];
    for (const file of list) {
      try {
        await uploadFile(file);
      } catch (err) {
        failed.push(err instanceof Error ? err.message : `${file.name}: upload failed`);
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setErrors(failed);
    setProgress(null);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div
      className="a-drop"
      data-over={over || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
    >
      <p>
        <strong>Drop files here</strong> or
      </p>
      <button type="button" className="a-btn a-btn-primary" onClick={() => input.current?.click()} disabled={Boolean(progress)}>
        Choose files
      </button>
      <p className="a-help">JPG, PNG, WebP, AVIF, SVG (≤ 20 MB) · MP4/WebM video · PDF menus & brochures (≤ 25 MB). Keep photos under ~3 MB.</p>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,video/mp4,video/webm,application/pdf"
        onChange={(e) => handle(e.target.files)}
      />
      {progress && (
        <div style={{ width: "min(320px, 100%)" }} role="status">
          <div className="a-progress">
            <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
          <p className="a-help">
            Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of {progress.total}…
          </p>
        </div>
      )}
      {errors.map((e) => (
        <p key={e} className="a-error">
          {e}
        </p>
      ))}
    </div>
  );
}
