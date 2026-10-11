"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { MediaThumb } from "@/lib/admin/data";
import { listMediaForPicker } from "@/app/admin/actions";
import { acceptAttr, uploadFile } from "./upload";

export type MediaItem = { id: string; url: string | null; title: string | null; path: string; kind: string };

export function thumbToItem(id: string | null | undefined, thumb?: MediaThumb): MediaItem | null {
  if (!id) return null;
  return { id, url: thumb?.url ?? null, title: thumb?.title ?? null, path: thumb?.path ?? "", kind: thumb?.kind ?? "image" };
}

function Preview({ item, size }: { item: MediaItem | null; size: "sm" | "md" }) {
  const cls = `a-media-preview${size === "sm" ? " a-media-preview-sm" : ""}`;
  if (!item) return <span className={cls}>Empty</span>;
  // eslint-disable-next-line @next/next/no-img-element
  if (item.url && item.kind === "image") return <img src={item.url} alt="" className={cls} />;
  return <span className={cls}>{item.kind === "video" ? "VIDEO" : "PDF"}</span>;
}

/**
 * Controlled media picker: choose from the library or upload new, with preview.
 * Used by both classic record forms (via MediaField) and the page builder.
 */
export function MediaPicker({
  value,
  onChange,
  accept,
  locked,
  size = "md",
}: {
  value: MediaItem | null;
  onChange: (item: MediaItem | null) => void;
  accept: string;
  locked?: boolean;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, startLoading] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const load = (q: string) =>
    startLoading(async () => {
      setItems(await listMediaForPicker(accept, q));
    });

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFile(files[0]);
      onChange({ id: uploaded.id, url: uploaded.url, title: uploaded.title, path: uploaded.path, kind: uploaded.kind });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <>
      <div
        className="a-media"
        data-over={dragOver || undefined}
        onDragOver={(e) => {
          if (locked || !e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (locked || !e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          onUpload(e.dataTransfer.files);
        }}
      >
        <Preview item={value} size={size} />
        <div className="a-media-meta">
          <p>{value ? value.title || value.path || "Selected" : uploading ? "Uploading…" : "Drop a file here, or"}</p>
          {!locked && (
            <div className="a-media-buttons">
              <button
                type="button"
                className="a-btn a-btn-sm"
                onClick={() => {
                  setOpen(true);
                  load("");
                }}
              >
                Library
              </button>
              <button type="button" className="a-btn a-btn-sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
              {value && (
                <button type="button" className="a-btn a-btn-sm a-btn-ghost" onClick={() => onChange(null)}>
                  Remove
                </button>
              )}
              {value && (
                <a className="a-btn a-btn-sm a-btn-ghost" href={`/admin/r/media/${value.id}`} target="_blank" rel="noopener noreferrer" title="Edit alt text in the media library">
                  Alt text ↗
                </a>
              )}
            </div>
          )}
          {error && <p className="a-error">{error}</p>}
        </div>
        <input ref={fileInput} type="file" hidden accept={acceptAttr(accept)} onChange={(e) => onUpload(e.target.files)} />
      </div>

      <dialog ref={dialog} className="a-dialog" onClose={() => setOpen(false)} aria-label="Media library">
        <div className="a-dialog-head">
          <h2>Choose from the media library</h2>
          <input
            className="a-input"
            style={{ maxWidth: 260 }}
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              load(e.target.value);
            }}
          />
          <button type="button" className="a-btn a-btn-sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload new"}
          </button>
          <button type="button" className="a-btn a-btn-sm" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        {loading && items.length === 0 ? (
          <p className="a-empty">Loading…</p>
        ) : items.length === 0 ? (
          <p className="a-empty">No matching files. Upload one to get started.</p>
        ) : (
          <div className="a-grid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="a-tile"
                aria-pressed={value?.id === item.id}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item.url && item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="a-tile-img" loading="lazy" />
                ) : (
                  <span className="a-tile-img">{item.kind === "video" ? "VIDEO" : "PDF"}</span>
                )}
                <p>{item.title || item.path}</p>
              </button>
            ))}
          </div>
        )}
      </dialog>
    </>
  );
}

/** Form-field wrapper: keeps the chosen media id in a hidden input for classic record forms. */
export function MediaField({ name, accept, initial, thumb, locked }: { name: string; accept: string; initial: string | null; thumb?: MediaThumb; locked?: boolean }) {
  const [value, setValue] = useState<MediaItem | null>(thumbToItem(initial, thumb));
  return (
    <>
      <input type="hidden" name={name} value={value?.id ?? ""} />
      <MediaPicker value={value} onChange={setValue} accept={accept} locked={locked} />
    </>
  );
}
