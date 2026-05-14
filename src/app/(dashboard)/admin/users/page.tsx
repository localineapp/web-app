import UsersTable from "@/components/dashboard/admin/UsersTable"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Users",
}

export default async function AdminUsersPage() {
  const requestHeaders = await headers()

  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  const users = await auth.api.listUsers({
    headers: requestHeaders,
    query: {
      sortBy: "createdAt",
      sortDirection: "asc",
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>

      <div>
        <UsersTable session={session} users={users} />
      </div>
    </div>
  )
}
