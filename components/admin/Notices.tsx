/** Flash messages driven by query params after redirects (saved / deleted / error). */
export function Notices({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  return (
    <>
      {searchParams.saved && (
        <p className="a-alert a-alert-ok" role="status">
          Saved. Changes are live on the website for published content.
        </p>
      )}
      {searchParams.deleted && (
        <p className="a-alert a-alert-ok" role="status">
          Deleted.
        </p>
      )}
      {error && (
        <p className="a-alert a-alert-bad" role="alert">
          {error === "owner-only" ? "Only owners can manage admin users." : error === "self" ? "You can't remove your own access." : error}
        </p>
      )}
    </>
  );
}
