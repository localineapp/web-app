import {
  isDiscordLoginEnabled,
  isGitHubLoginEnabled,
  isGoogleLoginEnabled,
} from "@/actions/get-env"
import ConnectionsCard from "@/components/dashboard/account/security/ConnectionsCard"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Connections",
}

export default async function ConnectionsPage() {
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })

  const [googleEnabled, githubEnabled, discordEnabled] = await Promise.all([
    isGoogleLoginEnabled(),
    isGitHubLoginEnabled(),
    isDiscordLoginEnabled(),
  ])
  const enabledProviders = [
    googleEnabled ? "google" : null,
    githubEnabled ? "github" : null,
    discordEnabled ? "discord" : null,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Manage your connected accounts. You can connect your account to
          third-party services for easier sign-in.
        </p>
      </div>

      <div>
        <ConnectionsCard
          accounts={accounts}
          enabledProviders={enabledProviders}
        />
      </div>
    </div>
  )
}
