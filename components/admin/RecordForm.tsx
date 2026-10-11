"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import type { FieldGroup, Option } from "@/lib/admin/types";
import type { MediaThumb, Row } from "@/lib/admin/data";
import { saveRecord, type SaveState } from "@/app/admin/actions";
import { FieldInput } from "./FieldInput";

interface Props {
  resourceKey: string;
  id: string | null;
  groups: FieldGroup[];
  values: Row;
  options: Record<string, Option[]>;
  thumbs: Record<string, MediaThumb>;
  readOnly: boolean;
  isNew: boolean;
  returnTo: string;
  extra?: ReactNode;
}

const initial: SaveState = { status: "idle" };

export function RecordForm({ resourceKey, id, groups, values, options, thumbs, readOnly, isNew, returnTo, extra }: Props) {
  const [state, action, pending] = useActionState(saveRecord.bind(null, resourceKey, id), initial);
  const errors = state.fieldErrors ?? {};

  // The last group is shown in the sticky aside when it is a "Publishing"-style group.
  const asideGroup = groups.length > 1 && /publish/i.test(groups[groups.length - 1].title) ? groups[groups.length - 1] : null;
  const mainGroups = asideGroup ? groups.slice(0, -1) : groups;

  // Long forms get tabs. All panels stay in the DOM so every field submits together.
  const tabbed = mainGroups.length >= 3;
  const [tab, setTab] = useState(0);
  const groupHasError = (g: FieldGroup) => g.fields.some((f) => errors[f.name]);
  const errorTab = mainGroups.findIndex(groupHasError);
  const activeTab = state.status === "error" && errorTab >= 0 && !groupHasError(mainGroups[tab]) ? errorTab : tab;

  const renderGroup = (group: FieldGroup, index = -1) => (
    <section key={group.title} className="a-panel" hidden={tabbed && index >= 0 && index !== activeTab}>
      <div className="a-panel-head">
        <div>
          <h2>{group.title}</h2>
          {group.description && <p>{group.description}</p>}
        </div>
      </div>
      <div className="a-panel-body a-fields">
        {group.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={values[field.name]}
            options={field.options ?? options[field.name] ?? []}
            thumb={thumbs[String(values[field.name] ?? "")]}
            error={errors[field.name]}
            locked={readOnly || field.readOnly || (!isNew && field.createOnly)}
          />
        ))}
      </div>
    </section>
  );

  const saveBar = !readOnly && (
    <div className="a-savebar">
      <button type="submit" className="a-btn a-btn-primary" disabled={pending}>
        {pending ? "Saving…" : isNew ? "Create" : "Save changes"}
      </button>
      {state.status === "error" && state.message && (
        <span className="a-error" role="alert">
          {state.message}
        </span>
      )}
    </div>
  );

  // Dispatch manually so React doesn't reset the editor's input when validation fails.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  return (
    <form onSubmit={onSubmit} className="a-form">
      {returnTo && <input type="hidden" name="__return" value={returnTo} />}
      <div className="a-form-layout">
        <div className="a-form">
          {tabbed && (
            <div className="a-tabs" role="tablist" aria-label="Sections of this form">
              {mainGroups.map((g, i) => (
                <button
                  key={g.title}
                  type="button"
                  role="tab"
                  aria-selected={i === activeTab}
                  data-error={groupHasError(g) || undefined}
                  onClick={() => setTab(i)}
                >
                  {g.title}
                </button>
              ))}
            </div>
          )}
          {mainGroups.map((g, i) => renderGroup(g, i))}
          {extra}
          {!asideGroup && saveBar}
        </div>
        {asideGroup && (
          <aside className="a-form-aside a-form">
            {renderGroup(asideGroup)}
            {saveBar}
          </aside>
        )}
      </div>
    </form>
  );
}
