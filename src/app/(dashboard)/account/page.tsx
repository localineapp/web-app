import ProfileDetailsCard from "@/components/dashboard/account/ProfileDetailsCard"
import ProfileInformationCard from "@/components/dashboard/account/ProfileInformatioCard"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Public Profile",
}

export default async function PublicProfilePage() {
  const requestHeaders = await headers()

  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  const accounts = await auth.api.listUserAccounts({
    headers: requestHeaders,
  })

  const githubAccount = accounts.find(
    (account) => account.providerId === "github"
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Public Profile</h1>
        <p className="text-muted-foreground">
          Manage your public profile information. You can also see details about
          your account.
        </p>
      </div>

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        <div className="w-full min-w-0 xl:flex-1">
          <ProfileDetailsCard session={session} githubAccount={githubAccount} />
        </div>
        <div className="w-full min-w-0 xl:flex-1">
          <ProfileInformationCard session={session} />
        </div>
      </div>
    </div>
  )
}
