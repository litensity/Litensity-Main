"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuilderItem, BuilderSection, BuilderStat } from "@/lib/admin/pages";
import type { MediaThumb } from "@/lib/admin/data";
import type { SectionInput } from "@/app/admin/pages-actions";
import { TONE_LABELS, type SectionField, type SectionKind, type Tone } from "@/lib/sections/kinds";
import { ICON_NAMES, Icon } from "@/components/ui/Icon";
import { MediaPicker, thumbToItem, type MediaItem } from "../MediaField";

interface Props {
  section: BuilderSection;
  kind: SectionKind;
  thumbs: Record<string, MediaThumb>;
  saving: boolean;
  onDirty: (dirty: boolean) => void;
  onSave: (input: SectionInput) => void;
  onClose: () => void;
}

const TONE_SWATCH: Record<Tone, string> = { paper: "#f3eee6", cream: "#fbf8f3", ink: "#16110d", ember: "#e0461b", brand: "linear-gradient(135deg,#c3002d,#ffc10e,#013240)" };

const FIELD_LABEL: Record<SectionField, string> = {
  eyebrow: "Small label above the heading",
  heading: "Heading",
  subheading: "Subheading",
  body: "Text",
  cta: "Button",
  cta2: "Second button",
  media: "Image",
  video: "Video (optional — plays instead of the image)",
};

type Draft = Omit<BuilderSection, "id" | "key" | "kind" | "visible" | "updatedAt"> & {
  media: MediaItem | null;
  video: MediaItem | null;
  itemMedia: Record<number, MediaItem | null>;
};

function toDraft(s: BuilderSection, thumbs: Record<string, MediaThumb>): Draft {
  return {
    ...s,
    media: thumbToItem(s.mediaId, thumbs[s.mediaId ?? ""]),
    video: thumbToItem(s.videoId, thumbs[s.videoId ?? ""]),
    itemMedia: Object.fromEntries(s.items.map((i, idx) => [idx, thumbToItem(i.mediaId, thumbs[i.mediaId ?? ""])])),
  };
}

function toInput(d: Draft): SectionInput {
  return {
    tone: (d.tone as SectionInput["tone"]) ?? null,
    layout: d.layout,
    eyebrow: d.eyebrow,
    heading: d.heading,
    subheading: d.subheading,
    body: d.body,
    ctaLabel: d.ctaLabel,
    ctaHref: d.ctaHref,
    cta2Label: d.cta2Label,
    cta2Href: d.cta2Href,
    mediaId: d.media?.id ?? null,
    videoId: d.video?.id ?? null,
    items: d.items.map((i, idx) => ({ ...i, mediaId: d.itemMedia[idx]?.id ?? null })),
    stats: d.stats,
  };
}

const PLACEHOLDER = "[CLIENT CONTENT REQUIRED]";

export function SectionEditor({ section, kind, thumbs, saving, onDirty, onSave, onClose }: Props) {
  const initial = useMemo(() => toDraft(section, thumbs), [section, thumbs]);
  const [draft, setDraft] = useState<Draft>(initial);
  const dirty = useMemo(() => JSON.stringify(toInput(draft)) !== JSON.stringify(toInput(initial)), [draft, initial]);

  useEffect(() => onDirty(dirty), [dirty, onDirty]);

  // Ctrl/Cmd + S saves the open section.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) onSave(toInput(draft));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, draft, onSave]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const has = (f: SectionField) => kind.fields.includes(f);
  const label = (f: SectionField) => kind.labels?.[f] ?? FIELD_LABEL[f];

  const textField = (f: "eyebrow" | "heading" | "subheading" | "body", multiline = false) => {
    if (!has(f)) return null;
    const value = draft[f];
    const missing = value.includes(PLACEHOLDER);
    return (
      <label className={`a-field${multiline ? " a-field-full" : ""}`}>
        <span className="a-label">{label(f)}</span>
        {multiline ? (
          <textarea className="a-input" rows={f === "body" ? 5 : 2} value={value} onChange={(e) => set(f, e.target.value)} data-missing={missing || undefined} />
        ) : (
          <input className="a-input" value={value} onChange={(e) => set(f, e.target.value)} data-missing={missing || undefined} />
        )}
        {f === "heading" && <span className="a-help">Wrap words in *asterisks* for the italic accent. Press Enter for a line break.</span>}
        {f === "body" && <span className="a-help">Leave a blank line between paragraphs.</span>}
        {missing && <span className="a-help a-warn-text">Placeholder text — hidden on the live site until replaced.</span>}
      </label>
    );
  };

  const ctaField = (which: "cta" | "cta2") => {
    if (!has(which)) return null;
    const l = which === "cta" ? "ctaLabel" : "cta2Label";
    const h = which === "cta" ? "ctaHref" : "cta2Href";
    return (
      <fieldset className="b-pair a-field-full">
        <legend className="a-label">{label(which)}</legend>
        <input className="a-input" placeholder="Button text" value={draft[l]} onChange={(e) => set(l, e.target.value)} aria-label={`${label(which)} text`} />
        <input className="a-input" placeholder="/page, #section or https://…" value={draft[h]} onChange={(e) => set(h, e.target.value)} aria-label={`${label(which)} link`} />
      </fieldset>
    );
  };

  /* ------------------------------- items */
  const updateItem = (idx: number, patch: Partial<BuilderItem>) => setDraft((d) => ({ ...d, items: d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const moveItem = (idx: number, delta: number) =>
    setDraft((d) => {
      const j = idx + delta;
      if (j < 0 || j >= d.items.length) return d;
      const items = [...d.items];
      [items[idx], items[j]] = [items[j], items[idx]];
      const itemMedia = { ...d.itemMedia, [idx]: d.itemMedia[j] ?? null, [j]: d.itemMedia[idx] ?? null };
      return { ...d, items, itemMedia };
    });
  const removeItem = (idx: number) =>
    setDraft((d) => {
      const items = d.items.filter((_, i) => i !== idx);
      const itemMedia: Draft["itemMedia"] = {};
      d.items.forEach((_, i) => {
        if (i < idx) itemMedia[i] = d.itemMedia[i] ?? null;
        if (i > idx) itemMedia[i - 1] = d.itemMedia[i] ?? null;
      });
      return { ...d, items, itemMedia };
    });
  const addItem = () => setDraft((d) => ({ ...d, items: [...d.items, { title: "", body: "", icon: "", href: "", meta: "", mediaId: null }] }));

  /* ------------------------------- stats */
  const updateStat = (idx: number, patch: Partial<BuilderStat>) => setDraft((d) => ({ ...d, stats: d.stats.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));

  return (
    <div className="b-editor">
      {kind.dataLink && (
        <p className="b-note">
          This block shows live data.{" "}
          <a href={kind.dataLink.href} target="_blank" rel="noopener noreferrer" className="a-link">
            {kind.dataLink.label} ↗
          </a>
        </p>
      )}

      {(kind.tones || kind.layouts) && (
        <div className="b-style">
          {kind.layouts && (
            <div className="a-field">
              <span className="a-label">Layout</span>
              <div className="b-seg" role="radiogroup" aria-label="Layout">
                {kind.layouts.map((l) => (
                  <button key={l.value} type="button" role="radio" aria-checked={draft.layout === l.value} onClick={() => set("layout", l.value)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {kind.tones && (
            <div className="a-field">
              <span className="a-label">Background</span>
              <div className="b-swatches" role="radiogroup" aria-label="Background colour">
                {kind.tones.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={(draft.tone ?? kind.tones![0]) === t} onClick={() => set("tone", t)} title={TONE_LABELS[t]}>
                    <span style={{ background: TONE_SWATCH[t] }} />
                    {TONE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="a-fields">
        {textField("eyebrow")}
        {textField("heading", true)}
        {textField("subheading")}
        {textField("body", true)}
        {ctaField("cta")}
        {ctaField("cta2")}
        {has("media") && (
          <div className="a-field a-field-full">
            <span className="a-label">{label("media")}</span>
            <MediaPicker value={draft.media} onChange={(m) => set("media", m)} accept="image" />
          </div>
        )}
        {has("video") && (
          <div className="a-field a-field-full">
            <span className="a-label">{label("video")}</span>
            <MediaPicker value={draft.video} onChange={(m) => set("video", m)} accept="video" size="sm" />
          </div>
        )}
      </div>

      {kind.items && (
        <div className="b-items">
          <div className="b-items-head">
            <span className="a-label">
              {kind.items.label} <span className="admin-muted">({draft.items.length})</span>
            </span>
            <button type="button" className="a-btn a-btn-sm" onClick={addItem}>
              + Add {kind.items.singular}
            </button>
          </div>
          {draft.items.length === 0 && <p className="a-help">No {kind.items.label.toLowerCase()} yet.</p>}
          <ol className="b-item-list">
            {draft.items.map((item, idx) => {
              const f = kind.items!.fields;
              const l = kind.items!.labels ?? {};
              return (
                <li key={item.id ?? `new-${idx}`} className="b-item">
                  <div className="b-item-tools">
                    <span className="b-item-index">{idx + 1}</span>
                    <button type="button" className="b-tool" onClick={() => moveItem(idx, -1)} disabled={idx === 0} aria-label="Move up">
                      <Icon name="chevron-up" size={14} />
                    </button>
                    <button type="button" className="b-tool" onClick={() => moveItem(idx, 1)} disabled={idx === draft.items.length - 1} aria-label="Move down">
                      <Icon name="chevron-down" size={14} />
                    </button>
                    <button type="button" className="b-tool b-tool-danger" onClick={() => removeItem(idx)} aria-label={`Remove ${kind.items!.singular}`}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                  <div className="b-item-fields">
                    {f.includes("media") && (
                      <MediaPicker
                        value={draft.itemMedia[idx] ?? null}
                        onChange={(m) => setDraft((d) => ({ ...d, itemMedia: { ...d.itemMedia, [idx]: m } }))}
                        accept="image"
                        size="sm"
                      />
                    )}
                    {f.includes("meta") && (
                      <input className="a-input" placeholder={l.meta ?? "Label"} value={item.meta} onChange={(e) => updateItem(idx, { meta: e.target.value })} aria-label={l.meta ?? "Label"} />
                    )}
                    {f.includes("title") && (
                      <input
                        className="a-input b-item-title"
                        placeholder={l.title ?? "Title"}
                        value={item.title}
                        onChange={(e) => updateItem(idx, { title: e.target.value })}
                        aria-label={l.title ?? "Title"}
                        data-missing={item.title.includes(PLACEHOLDER) || undefined}
                      />
                    )}
                    {f.includes("body") && (
                      <textarea
                        className="a-input"
                        rows={2}
                        placeholder={l.body ?? "Description"}
                        value={item.body}
                        onChange={(e) => updateItem(idx, { body: e.target.value })}
                        aria-label={l.body ?? "Description"}
                        data-missing={item.body.includes(PLACEHOLDER) || undefined}
                      />
                    )}
                    <div className="b-item-row">
                      {f.includes("icon") && (
                        <select className="a-input" value={item.icon} onChange={(e) => updateItem(idx, { icon: e.target.value })} aria-label="Icon">
                          <option value="">No icon</option>
                          {ICON_NAMES.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      )}
                      {f.includes("href") && (
                        <input className="a-input" placeholder={l.href ?? "Link (optional)"} value={item.href} onChange={(e) => updateItem(idx, { href: e.target.value })} aria-label={l.href ?? "Link"} />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {kind.stats && (
        <div className="b-items">
          <div className="b-items-head">
            <span className="a-label">Numbers</span>
            <button
              type="button"
              className="a-btn a-btn-sm"
              onClick={() => setDraft((d) => ({ ...d, stats: [...d.stats, { label: "", source: "manual", value: "", suffix: "" }] }))}
              disabled={draft.stats.length >= 6}
            >
              + Add number
            </button>
          </div>
          <p className="a-help">“Auto” numbers update themselves from the Store Master. Never enter a figure Litensity has not confirmed — empty numbers stay hidden.</p>
          <ol className="b-item-list">
            {draft.stats.map((stat, idx) => (
              <li key={stat.id ?? `s-${idx}`} className="b-stat">
                <input className="a-input" placeholder="Label" value={stat.label} onChange={(e) => updateStat(idx, { label: e.target.value })} aria-label="Label" />
                <select className="a-input" value={stat.source} onChange={(e) => updateStat(idx, { source: e.target.value as BuilderStat["source"] })} aria-label="Source">
                  <option value="manual">Manual</option>
                  <option value="stores_live">Auto · live stores</option>
                  <option value="cities">Auto · cities</option>
                  <option value="states">Auto · states</option>
                  <option value="brands">Auto · brands</option>
                </select>
                <input
                  className="a-input"
                  placeholder={stat.source === "manual" ? "Value" : "Automatic"}
                  value={stat.source === "manual" ? stat.value : ""}
                  disabled={stat.source !== "manual"}
                  onChange={(e) => updateStat(idx, { value: e.target.value })}
                  aria-label="Value"
                />
                <input className="a-input" placeholder="Suffix" value={stat.suffix} onChange={(e) => updateStat(idx, { suffix: e.target.value })} aria-label="Suffix" />
                <button type="button" className="b-tool b-tool-danger" onClick={() => setDraft((d) => ({ ...d, stats: d.stats.filter((_, i) => i !== idx) }))} aria-label="Remove number">
                  <Icon name="trash" size={14} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {kind.fields.length === 0 && !kind.items && !kind.stats && !kind.tones && (
        <p className="b-note">This block has no text of its own — reorder, hide or show it from the toolbar above.</p>
      )}

      <div className="b-editor-foot">
        <button type="button" className="a-btn a-btn-primary" disabled={!dirty || saving} onClick={() => onSave(toInput(draft))}>
          {saving ? "Saving…" : dirty ? "Save section" : "Saved"}
        </button>
        {dirty && (
          <button type="button" className="a-btn" onClick={() => setDraft(initial)} disabled={saving}>
            Undo changes
          </button>
        )}
        <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>
          Close
        </button>
        <span className="admin-muted b-shortcut">Ctrl + S to save</span>
      </div>
    </div>
  );
}
