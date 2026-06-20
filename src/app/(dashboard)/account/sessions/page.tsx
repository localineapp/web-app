import {
  RevokeAllSessionsDialog,
  RevokeOtherSessionsDialog,
} from "@/components/dashboard/account/sessions/RevokeSessionsDialogs"
import SessionsTable from "@/components/dashboard/account/sessions/SessionsTable"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Sessions",
}

export default async function SessionsPage() {
  const sessions = await auth.api.listSessions({
    headers: await headers(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            Manage your active sessions and view their details.
          </p>
        </div>

        <div className="flex gap-2">
          <RevokeOtherSessionsDialog />
          <RevokeAllSessionsDialog />
        </div>
      </div>

      <div>
        <SessionsTable sessions={sessions} />
      </div>
    </div>
  )
}
