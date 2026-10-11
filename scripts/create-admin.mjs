// Creates (or promotes) an admin user.
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [owner|editor] [Display Name]
import { createClient } from "@supabase/supabase-js";

const [, , email, password, role = "owner", ...nameParts] = process.argv;
if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [owner|editor] [name]");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

let userId;
const { data: created, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error(error.message);
    process.exit(1);
  }
  userId = existing.id;
  console.log("User already exists — granting admin access.");
} else {
  userId = created.user.id;
}

const { error: profileError } = await db
  .from("admin_profiles")
  .upsert({ user_id: userId, role: role === "editor" ? "editor" : "owner", display_name: nameParts.join(" ") || null });
if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}
console.log(`✔ ${email} is now an admin (${role}).`);
