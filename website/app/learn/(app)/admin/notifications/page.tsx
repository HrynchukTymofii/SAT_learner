import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/getAuth"
import { db } from "@/lib/db"
import NotificationsAdmin from "./notifications-admin"

// Admins (User.role = "admin") send in-app + push notifications to the mobile app
export default async function AdminNotificationsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")
  const me = await db.user.findUnique({ where: { userId }, select: { role: true } })
  if (me?.role !== "admin") notFound()

  const [history, phones] = await Promise.all([
    db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { _count: { select: { reads: true } } } }),
    db.pushToken.count(),
  ])

  return (
    <NotificationsAdmin
      phones={phones}
      history={history.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        audience: n.audience,
        pushCount: n.pushCount,
        reads: n._count.reads,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  )
}
