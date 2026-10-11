"use client";

import { useActionState } from "react";
import { inviteAdmin, type SaveState } from "@/app/admin/actions";

export function InviteAdminForm() {
  const [state, action, pending] = useActionState(inviteAdmin, { status: "idle" } as SaveState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="a-form">
      {state.message && <p className="a-alert a-alert-bad">{state.message}</p>}
      <label className="a-field">
        <span className="a-label">Name</span>
        <input className="a-input" name="display_name" />
      </label>
      <label className="a-field">
        <span className="a-label">
          Email <span className="a-req">*</span>
        </span>
        <input className="a-input" name="email" type="email" required aria-invalid={e.email ? true : undefined} />
        {e.email && <span className="a-error">{e.email}</span>}
      </label>
      <label className="a-field">
        <span className="a-label">
          Temporary password <span className="a-req">*</span>
        </span>
        <input className="a-input" name="password" type="text" minLength={12} required autoComplete="new-password" aria-invalid={e.password ? true : undefined} />
        <span className="a-help">At least 12 characters. Share it securely; they can change it after signing in.</span>
        {e.password && <span className="a-error">{e.password}</span>}
      </label>
      <label className="a-field">
        <span className="a-label">Role</span>
        <select className="a-input" name="role" defaultValue="editor">
          <option value="editor">Editor — manages content</option>
          <option value="owner">Owner — also manages admins</option>
        </select>
      </label>
      <button className="a-btn a-btn-primary" type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add admin"}
      </button>
    </form>
  );
}
