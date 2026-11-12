import "server-only";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/getAuth";
import { db } from "@/lib/db";
import { isCourseAdmin } from "@/lib/admin-check";

// Who counts as an admin: see lib/admin-check.ts

export async function getAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { userId }, select: { userId: true, email: true, name: true, role: true } });
  return user && isCourseAdmin(user) ? user : null;
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
