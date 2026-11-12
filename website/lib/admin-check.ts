/**
 * Course admins: User.role = "admin" AND the email is in ADMIN_EMAILS (comma separated).
 * Both are required, so a role set by mistake in the database alone isn't enough.
 * Without ADMIN_EMAILS (local dev) the role alone is enough.
 * Plain function (no server-only imports) so lib/auth.ts and the API routes can use it too.
 */
export function isCourseAdmin(user: { role?: string | null; email?: string | null } | null | undefined) {
  if (user?.role !== "admin") return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !list.length || list.includes((user.email || "").toLowerCase());
}
