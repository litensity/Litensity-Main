-- Admins can remove entries from the lead delivery log (e.g. test or spam submissions).
-- The Google Sheet row is untouched; otp_requests.lead_submission_id is set null by its FK.
create policy lead_submissions_admin_delete on public.lead_submissions
  for delete to authenticated using (public.is_admin());
