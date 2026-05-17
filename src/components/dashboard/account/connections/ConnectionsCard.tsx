"use client"

import { DiscordIcon, GitHubIcon, GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  useState,
  type ComponentType,
  type MouseEvent,
  type SVGProps,
} from "react"
import { toast } from "sonner"

export default function ConnectionsCard({
  accounts,
  enabledProviders,
}: {
  accounts: Awaited<ReturnType<typeof auth.api.listUserAccounts>>
  enabledProviders: string[]
}) {
  const [loading, setLoading] = useState(false)

  function isProviderEnabled(provider: string) {
    return enabledProviders.includes(provider)
  }

  function isProviderConnected(provider: string) {
    return accounts.some((account) => account.providerId === provider)
  }

  return (
    <Card className="w-full max-w-2xl">
      <ProviderCardContent
        name="google"
        displayName="Google"
        enabled={isProviderEnabled("google")}
        connected={isProviderConnected("google")}
        Icon={GoogleIcon}
        loading={loading}
        setLoading={setLoading}
      />
      <Separator />
      <ProviderCardContent
        name="github"
        displayName="GitHub"
        enabled={isProviderEnabled("github")}
        connected={isProviderConnected("github")}
        Icon={GitHubIcon}
        loading={loading}
        setLoading={setLoading}
      />
      <Separator />
      <ProviderCardContent
        name="discord"
        displayName="Discord"
        enabled={isProviderEnabled("discord")}
        connected={isProviderConnected("discord")}
        Icon={DiscordIcon}
        loading={loading}
        setLoading={setLoading}
      />
    </Card>
  )
}

function ProviderCardContent({
  name,
  displayName,
  enabled,
  connected,
  Icon,
  loading,
  setLoading,
}: {
  name: string
  displayName: string
  enabled: boolean
  connected: boolean
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const handleLink = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.linkSocial({
      provider: name,
      callbackURL: `${window.location.origin}/account/connections`,
      fetchOptions: {
        onSuccess: () => {
          toast.success(`Redirecting to ${displayName} for verification...`)
        },
        onError: ({ error }) => {
          toast.error(
            `Unable to link ${displayName} account. ${`(${error?.message})` || "Please try again."}`
          )
          setLoading(false)
        },
      },
    })
  }

  const handleUnlink = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.unlinkAccount({
      providerId: name.toLowerCase(),
      fetchOptions: {
        onSuccess: () => {
          toast.success(`${displayName} account unlinked successfully.`)
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            `Unable to unlink ${displayName} account. ${`(${error?.message})` || "Please try again."}`
          )
          setLoading(false)
        },
      },
    })
  }

  return (
    <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <Icon className="h-6 w-6 shrink-0" />
        <div className="min-w-0 space-y-1">
          <CardTitle>{displayName}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-xs">
            <span>Status:</span>
            <span
              className={cn(
                !enabled
                  ? "text-blue-600 dark:text-blue-400"
                  : connected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
              )}
            >
              {!enabled
                ? "Not configured"
                : connected
                  ? "Connected"
                  : "Not connected"}
            </span>
          </CardDescription>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
        {!enabled ? (
          <Tooltip>
            <TooltipTrigger asChild className="cursor-not-allowed">
              <span className="inline-flex">
                <Button type="button" variant="outline" size="sm" disabled>
                  Link
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{`${displayName} login is not configured. Please contact your administrator for assistance.`}</TooltipContent>
          </Tooltip>
        ) : connected ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={handleUnlink}
          >
            Unlink
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={handleLink}
          >
            Link
          </Button>
        )}
      </div>
    </CardContent>
  )
}
