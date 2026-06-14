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

  const [session, accounts] = await Promise.all([
    auth.api.getSession({
      headers: requestHeaders,
    }),
    auth.api.listUserAccounts({
      headers: requestHeaders,
    }),
  ])

  const user = session?.user

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
        {user ? (
          <>
            <div className="w-full min-w-0 xl:flex-1">
              <ProfileDetailsCard user={user} githubAccount={githubAccount} />
            </div>
            <div className="w-full min-w-0 xl:flex-1">
              <ProfileInformationCard user={user} />
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
