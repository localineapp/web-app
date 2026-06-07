import { AccessDeniedPage } from "@/components/access-denied"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function ForbiddenPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const isAuthenticated = !!session?.session

  return <AccessDeniedPage isAuthenticated={isAuthenticated} />
}
