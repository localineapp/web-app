import DataExportCard from "@/components/dashboard/account/security/DataExportCard"
import DeleteAccountCard from "@/components/dashboard/account/security/DeleteAccountCard"
import SecurityDetailsCard from "@/components/dashboard/account/security/SecurityDetailsCard"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Security",
}

export default async function SecurityPage() {
  const requestHeaders = await headers()

  const [session, accounts] = await Promise.all([
    auth.api.getSession({
      headers: requestHeaders,
    }),
    auth.api.listUserAccounts({
      headers: requestHeaders,
    }),
  ])

  const user = session?.user

  const hasCredentialAccount = accounts.some(
    (account) => account.providerId === "credential"
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your security settings and preferences.
        </p>
      </div>

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        {user ? (
          <>
            <div className="w-full min-w-0 xl:flex-1">
              <SecurityDetailsCard
                user={user}
                hasCredentialAccount={hasCredentialAccount}
              />
            </div>
            <div className="w-full min-w-0 flex-col gap-4 space-y-4 xl:flex-1">
              <DataExportCard user={user} />
              <DeleteAccountCard />
            </div>
          </>
        ) : (
          <div className="w-full rounded-lg border bg-popover p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No user information available.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
