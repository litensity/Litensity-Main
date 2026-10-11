/* Admin resource registry types. The registry is the single description of
 * every editable table: the generic list/edit UI and the save action read it,
 * so only registered columns can ever be written from the admin. */

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "url"
  | "email"
  | "media"
  | "relation"
  | "date"
  | "time"
  | "tags"
  | "hours";

export interface Option {
  value: string;
  label: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: Option[];
  relation?: { table: string; labelColumn: string; valueColumn?: string; orderBy?: string };
  /** media fields: which kind of asset may be picked. */
  accept?: "image" | "document" | "video" | "image-or-video";
  full?: boolean;
  /** Only settable when creating (e.g. slugs, keys). */
  createOnly?: boolean;
  /** Shown but never written. */
  readOnly?: boolean;
  defaultValue?: string | number | boolean;
}

export interface FieldGroup {
  title: string;
  description?: string;
  fields: Field[];
}

export interface ListColumn {
  name: string;
  label: string;
  /** How to render: plain text, status badge, boolean tick, relation label, colour swatch, date. */
  format?: "text" | "status" | "boolean" | "relation" | "color" | "date" | "media";
}

export interface Filter {
  name: string;
  label: string;
  options?: Option[];
  relation?: Field["relation"];
}

export interface Child {
  resource: string;
  foreignKey: string;
  title: string;
}

export interface Resource {
  key: string;
  table: string;
  label: string;
  singular: string;
  group: string;
  description?: string;
  primaryKey?: string;
  titleField: string;
  list: ListColumn[];
  search?: string[];
  filters?: Filter[];
  /** Fixed filters for scoped resources, e.g. people.kind = founder. Also applied on create. */
  scope?: Record<string, string>;
  orderBy?: { column: string; ascending?: boolean }[];
  /** Enables up/down reordering on sort_order. */
  sortable?: boolean;
  groups: FieldGroup[];
  children?: Child[];
  canCreate?: boolean;
  /** Defaults to true for editable resources; a readOnly resource must opt in with `true`. */
  canDelete?: boolean;
  readOnly?: boolean;
  singleton?: boolean;
  /** Public path to preview a record (draft mode). */
  preview?: (row: Record<string, unknown>) => string | null;
  /** Hidden from the sidebar (reached through a parent). */
  hidden?: boolean;
}
