import { AccessDeniedPage } from "@/components/access-denied"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hasPermission = (
    await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permissions: {
          dashboard: ["admin"],
        },
      },
    })
  ).success

  if (!hasPermission) {
    return <AccessDeniedPage isAuthenticated={true} />
  }

  return <>{children}</>
}
