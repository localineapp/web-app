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

  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  const accounts = await auth.api.listUserAccounts({
    headers: requestHeaders,
  })

  const hasPassword = accounts.some(
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
        <div className="w-full min-w-0 xl:flex-1">
          <SecurityDetailsCard session={session} hasPassword={hasPassword} />
        </div>
        <div className="w-full min-w-0 flex-col gap-4 space-y-4 xl:flex-1">
          <DataExportCard session={session} />
          <DeleteAccountCard />
        </div>
      </div>
    </div>
  )
}
