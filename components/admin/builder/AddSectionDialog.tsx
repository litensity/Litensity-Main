"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionKind } from "@/lib/sections/kinds";

/** Section library: pick a block to insert. Unique blocks already on the page are disabled. */
export function AddSectionDialog({
  kinds,
  presentKinds,
  onPick,
  onClose,
}: {
  kinds: SectionKind[];
  presentKinds: Set<string>;
  onPick: (kind: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const q = query.trim().toLowerCase();
  const visible = kinds.filter((k) => !q || k.label.toLowerCase().includes(q) || k.description.toLowerCase().includes(q));
  const general = visible.filter((k) => k.pages === "content" && !k.pinned);
  const special = visible.filter((k) => k.pages !== "content" || k.pinned);

  const card = (k: SectionKind) => {
    const taken = (k.unique || k.pinned) && presentKinds.has(k.key);
    return (
      <button key={k.key} type="button" className="b-kind-card" disabled={taken} onClick={() => onPick(k.key)}>
        <span className={`b-kind-art b-art-${k.key}`} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{k.label}</strong>
        <span className="admin-muted">{taken ? "Already on this page" : k.description}</span>
      </button>
    );
  };

  return (
    <dialog ref={ref} className="a-dialog b-add" onClose={onClose} aria-label="Add a section">
      <div className="a-dialog-head">
        <h2>Add a section</h2>
        <input className="a-input" style={{ maxWidth: 240 }} type="search" placeholder="Search blocks…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        <button type="button" className="a-btn a-btn-sm" onClick={() => ref.current?.close()}>
          Cancel
        </button>
      </div>
      {general.length > 0 && (
        <>
          <p className="b-add-group">Building blocks</p>
          <div className="b-kind-grid">{general.map(card)}</div>
        </>
      )}
      {special.length > 0 && (
        <>
          <p className="b-add-group">Blocks for this page</p>
          <div className="b-kind-grid">{special.map(card)}</div>
        </>
      )}
      {visible.length === 0 && <p className="a-empty">No blocks match “{query}”.</p>}
    </dialog>
  );
}
