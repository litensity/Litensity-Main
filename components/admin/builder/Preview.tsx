"use client";

import { useEffect, useRef, useState } from "react";

const DEVICES = [
  { key: "desktop", label: "Desktop", width: 1440 },
  { key: "tablet", label: "Tablet", width: 820 },
  { key: "mobile", label: "Mobile", width: 390 },
] as const;

/**
 * Live preview of the page in draft mode. Reloads after every change and scrolls
 * to the section being edited. Desktop is rendered at full width and scaled to fit.
 */
export function Preview({ paths, reloadKey, focusKey }: { paths: { label: string; path: string }[]; reloadKey: number; focusKey: string | null }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");
  const [path, setPath] = useState(paths[0]?.path ?? "/");
  const [hidden, setHidden] = useState(false);
  const [box, setBox] = useState({ w: 600, h: 700 });
  const frameWrap = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const el = frameWrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden]);

  // Scroll the preview to the focused section without a reload when possible.
  useEffect(() => {
    if (!focusKey) return;
    const doc = iframe.current?.contentDocument;
    const target = doc?.getElementById(focusKey);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusKey]);

  const width = DEVICES.find((d) => d.key === device)!.width;
  const scale = Math.min(1, box.w / width);
  const src = `/api/preview?path=${encodeURIComponent(path)}&r=${reloadKey}`;

  if (hidden) {
    return (
      <button type="button" className="b-preview-show a-btn" onClick={() => setHidden(false)}>
        Show preview
      </button>
    );
  }

  return (
    <aside className="b-preview" aria-label="Live preview">
      <div className="b-preview-bar">
        <div className="b-seg" role="radiogroup" aria-label="Device">
          {DEVICES.map((d) => (
            <button key={d.key} type="button" role="radio" aria-checked={device === d.key} onClick={() => setDevice(d.key)}>
              {d.label}
            </button>
          ))}
        </div>
        {paths.length > 1 && (
          <select className="a-input b-preview-select" value={path} onChange={(e) => setPath(e.target.value)} aria-label="Preview page">
            {paths.map((p) => (
              <option key={p.path} value={p.path}>
                {p.label}
              </option>
            ))}
          </select>
        )}
        <a className="a-btn a-btn-sm" href={path} target="_blank" rel="noopener noreferrer">
          Open live ↗
        </a>
        <button type="button" className="a-btn a-btn-sm a-btn-ghost" onClick={() => setHidden(true)}>
          Hide
        </button>
      </div>
      <div ref={frameWrap} className="b-preview-frame">
        <iframe
          ref={iframe}
          key={`${src}-${device}`}
          src={src}
          title="Page preview"
          style={{ width, height: box.h / scale, transform: `scale(${scale})` }}
          onLoad={() => {
            if (!focusKey) return;
            iframe.current?.contentDocument?.getElementById(focusKey)?.scrollIntoView({ block: "start" });
          }}
        />
      </div>
      <p className="b-preview-note admin-muted">Preview shows drafts too. Hidden sections are left out, exactly as on the live site.</p>
    </aside>
  );
}
