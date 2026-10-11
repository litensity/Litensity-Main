"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { BuilderSection } from "@/lib/admin/pages";
import type { MediaThumb } from "@/lib/admin/data";
import { getKind, kindsForPage, type SectionKind } from "@/lib/sections/kinds";
import {
  addSection,
  deleteSection,
  duplicateSection,
  reorderSections,
  saveSection,
  setSectionVisibility,
} from "@/app/admin/pages-actions";
import { SectionEditor } from "./SectionEditor";
import { AddSectionDialog } from "./AddSectionDialog";
import { Preview } from "./Preview";
import { ToastStack, useToasts } from "./Toasts";
import { Icon } from "@/components/ui/Icon";

interface Props {
  pageKey: string;
  pageName: string;
  previewPaths: { label: string; path: string }[];
  initialSections: BuilderSection[];
  initialThumbs: Record<string, MediaThumb>;
}

type Result = Awaited<ReturnType<typeof saveSection>>;

function summary(section: BuilderSection, kind?: SectionKind): string {
  const text = (section.heading || section.eyebrow || section.body || "").replace(/\[CLIENT CONTENT REQUIRED\]\s*/g, "").replace(/\*/g, "");
  if (text) return text.split("\n")[0];
  if (kind?.dataLink) return "Content comes from " + kind.dataLink.label.replace(/^Edit /, "");
  return "No heading";
}

/**
 * Admin page builder: an ordered list of sections that can be dragged, hidden,
 * duplicated, deleted and edited inline, beside a live preview.
 */
export function PageBuilder({ pageKey, pageName, previewPaths, initialSections, initialThumbs }: Props) {
  const [sections, setSections] = useState(initialSections);
  const [thumbs, setThumbs] = useState(initialThumbs);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [adding, setAdding] = useState<{ afterId: string | null } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast, toasts } = useToasts();
  const listRef = useRef<HTMLOListElement>(null);

  const kinds = useMemo(() => kindsForPage(pageKey), [pageKey]);
  const presentKinds = useMemo(() => new Set(sections.map((s) => s.kind)), [sections]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const apply = useCallback(
    (result: Result, success?: string, focus?: boolean) => {
      if (!result.ok) {
        toast(result.error, "error");
        return false;
      }
      setSections(result.sections);
      setThumbs((t) => ({ ...t, ...result.thumbs }));
      setPreviewKey((k) => k + 1);
      if (focus && result.focusId) {
        const s = result.sections.find((x) => x.id === result.focusId);
        if (s) setFocusKey(s.key);
      }
      if (success) toast(success, "ok");
      return true;
    },
    [toast],
  );

  const run = (fn: () => Promise<Result>, success?: string, after?: (r: Result) => void) =>
    startTransition(async () => {
      const r = await fn();
      if (apply(r, success, true)) after?.(r);
    });

  function confirmDiscard(): boolean {
    return !dirty || window.confirm("You have unsaved changes in the open section. Discard them?");
  }

  function toggleOpen(id: string) {
    if (openId === id) {
      if (!confirmDiscard()) return;
      setOpenId(null);
      setDirty(false);
      return;
    }
    if (!confirmDiscard()) return;
    setDirty(false);
    setOpenId(id);
    const s = sections.find((x) => x.id === id);
    if (s) setFocusKey(s.key);
  }

  function move(id: string, delta: -1 | 1) {
    const movable = sections.filter((s) => !getKind(s.kind)?.pinned);
    const i = movable.findIndex((s) => s.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= movable.length) return;
    const next = [...movable];
    [next[i], next[j]] = [next[j], next[i]];
    commitOrder(next.map((s) => s.id));
  }

  function commitOrder(ids: string[]) {
    // Optimistic reorder, then persist.
    const byId = new Map(sections.map((s) => [s.id, s]));
    const pinned = sections.filter((s) => getKind(s.kind)?.pinned);
    setSections([...pinned, ...ids.map((id) => byId.get(id)!).filter(Boolean)]);
    run(() => reorderSections(pageKey, ids), "Order saved");
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const movable = sections.filter((s) => !getKind(s.kind)?.pinned).map((s) => s.id);
    const from = movable.indexOf(dragId);
    const to = movable.indexOf(targetId);
    if (from < 0 || to < 0) return;
    movable.splice(to, 0, movable.splice(from, 1)[0]);
    commitOrder(movable);
  }

  const visibleCount = sections.filter((s) => s.visible).length;

  return (
    <div className="b-shell">
      <div className="b-left">
        <header className="b-head">
          <div>
            <p className="admin-crumbs">
              <Link href="/admin/pages">Pages</Link> / <span>{pageName}</span>
            </p>
            <h1>{pageName}</h1>
            <p className="admin-muted">
              {sections.length} sections · {visibleCount} visible · drag to reorder, click to edit
            </p>
          </div>
          <button type="button" className="a-btn a-btn-primary" onClick={() => setAdding({ afterId: openId ?? sections[sections.length - 1]?.id ?? null })}>
            + Add section
          </button>
        </header>

        <ol ref={listRef} className="b-list" aria-label="Page sections">
          {sections.map((section) => {
            const kind = getKind(section.kind);
            const pinned = Boolean(kind?.pinned);
            const open = openId === section.id;
            const movable = sections.filter((s) => !getKind(s.kind)?.pinned);
            const mi = movable.findIndex((s) => s.id === section.id);
            return (
              <li
                key={section.id}
                className="b-card"
                data-open={open || undefined}
                data-hidden={!section.visible || undefined}
                data-dragging={dragId === section.id || undefined}
                data-over={overId === section.id && dragId !== section.id ? "" : undefined}
                onDragOver={(e) => {
                  if (!dragId || pinned) return;
                  e.preventDefault();
                  setOverId(section.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(section.id);
                  setDragId(null);
                  setOverId(null);
                }}
              >
                <div className="b-card-head">
                  <span
                    className="b-handle"
                    draggable={!pinned}
                    onDragStart={(e) => {
                      setDragId(section.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", section.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                    aria-hidden="true"
                    title={pinned ? "The hero always stays at the top" : "Drag to reorder"}
                    data-disabled={pinned || undefined}
                  >
                    <Icon name="grip" size={18} strokeWidth={3} />
                  </span>
                  <button type="button" className="b-card-main" onClick={() => toggleOpen(section.id)} aria-expanded={open}>
                    <span className="b-kind">
                      {kind?.label ?? section.kind}
                      {pinned && <span className="a-badge">Top</span>}
                      {!section.visible && <span className="a-badge a-badge-archived">Hidden</span>}
                    </span>
                    <span className="b-summary">{summary(section, kind)}</span>
                  </button>
                  <div className="b-tools" role="group" aria-label={`${kind?.label ?? "Section"} actions`}>
                    <button type="button" className="b-tool" onClick={() => move(section.id, -1)} disabled={pinned || mi <= 0 || pending} aria-label="Move up" title="Move up">
                      <Icon name="chevron-up" size={16} />
                    </button>
                    <button type="button" className="b-tool" onClick={() => move(section.id, 1)} disabled={pinned || mi === movable.length - 1 || pending} aria-label="Move down" title="Move down">
                      <Icon name="chevron-down" size={16} />
                    </button>
                    <button
                      type="button"
                      className="b-tool"
                      onClick={() => run(() => setSectionVisibility(section.id, !section.visible), section.visible ? "Section hidden from the website" : "Section is visible again")}
                      disabled={pending}
                      aria-label={section.visible ? "Hide section" : "Show section"}
                      title={section.visible ? "Hide from website" : "Show on website"}
                      aria-pressed={!section.visible}
                    >
                      <Icon name={section.visible ? "eye" : "eye-off"} size={16} />
                    </button>
                    <button
                      type="button"
                      className="b-tool"
                      onClick={() => run(() => duplicateSection(section.id), "Section duplicated", (r) => r.ok && r.focusId && setOpenId(r.focusId))}
                      disabled={pinned || kind?.unique || pending}
                      aria-label="Duplicate section"
                      title={pinned || kind?.unique ? "This section can only appear once" : "Duplicate"}
                    >
                      <Icon name="copy" size={16} />
                    </button>
                    <button
                      type="button"
                      className="b-tool b-tool-danger"
                      onClick={() => {
                        if (!window.confirm(`Delete the “${kind?.label ?? "section"}” section? Its content and items will be removed. Tip: hiding keeps the content.`)) return;
                        if (openId === section.id) {
                          setOpenId(null);
                          setDirty(false);
                        }
                        run(() => deleteSection(section.id), "Section deleted");
                      }}
                      disabled={pinned || pending}
                      aria-label="Delete section"
                      title={pinned ? "The hero can't be deleted" : "Delete"}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>

                {open && kind && (
                  <SectionEditor
                    key={`${section.id}-${section.updatedAt}`}
                    section={section}
                    kind={kind}
                    thumbs={thumbs}
                    saving={pending}
                    onDirty={setDirty}
                    onSave={(input) => run(() => saveSection(section.id, input), "Saved — live on the website", () => setDirty(false))}
                    onClose={() => toggleOpen(section.id)}
                  />
                )}

                <button type="button" className="b-insert" onClick={() => setAdding({ afterId: section.id })} aria-label="Add a section below">
                  + Add section here
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <Preview paths={previewPaths} reloadKey={previewKey} focusKey={focusKey} />

      {adding && (
        <AddSectionDialog
          kinds={kinds}
          presentKinds={presentKinds}
          onClose={() => setAdding(null)}
          onPick={(kindKey) => {
            const afterId = adding.afterId;
            setAdding(null);
            run(() => addSection(pageKey, kindKey, afterId), "Section added — fill it in below", (r) => {
              if (r.ok && r.focusId) {
                setDirty(false);
                setOpenId(r.focusId);
              }
            });
          }}
        />
      )}
      <ToastStack toasts={toasts} />
    </div>
  );
}
