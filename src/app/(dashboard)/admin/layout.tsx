import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hasPermission = (await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        dashboard: ["admin"],
      },
    },
  })).success

  if (!hasPermission) {
    return unauthorized()
  }

  return <>{children}</>
}
