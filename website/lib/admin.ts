import "server-only";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/getAuth";
import { db } from "@/lib/db";

/**
 * Course admins: User.role = "admin" AND the email is in ADMIN_EMAILS (comma separated).
 * Both are required, so a role set by mistake in the database alone doesn't open the panel.
 * Without ADMIN_EMAILS (local dev) the role alone is enough.
 */
const allowedEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export async function getAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { userId }, select: { userId: true, email: true, name: true, role: true } });
  if (user?.role !== "admin") return null;
  const list = allowedEmails();
  if (list.length && !list.includes((user.email || "").toLowerCase())) return null;
  return user;
}

/** For pages: logged-out users go to /login, everyone else who isn't an admin gets a 404. */
export async function requireAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  const admin = await getAdmin();
  if (!admin) notFound();
  return admin;
}

/** For server actions and API routes: throws, so nothing runs for non-admins. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Forbidden");
  return admin;
}
