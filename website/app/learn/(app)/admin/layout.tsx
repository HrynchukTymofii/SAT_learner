import { requireAdminPage } from "@/lib/admin"
import { AdminNav } from "./_components/admin-nav"

// Everything under /admin: only the course admins (see lib/admin.ts)
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage()
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <AdminNav name={admin.name || admin.email || "Admin"} />
      {children}
    </div>
  )
}
