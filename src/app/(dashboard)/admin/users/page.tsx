import UsersTable from "@/components/dashboard/admin/UsersTable"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Users",
}

export default async function AdminUsersPage() {
  const users = await auth.api
    .listUsers({
      headers: await headers(),
      query: {
        sortBy: "createdAt",
        sortDirection: "asc",
      },
    })
    .then((users) => users.users)

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>

      <div>
        <UsersTable users={users} />
      </div>
    </div>
  )
}
