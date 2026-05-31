"use client"

import { authClient, signIn } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { DiscordIcon, GitHubIcon, GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function SocialAuthButtons({
  loading,
  setLoading,
  googleEnabled,
  githubEnabled,
  discordEnabled,
}: {
  loading: boolean
  setLoading: (loading: boolean) => void
  googleEnabled?: boolean
  githubEnabled?: boolean
  discordEnabled?: boolean
}) {
  const [lastMethod, setLastMethod] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastMethod(authClient.getLastUsedLoginMethod())
  }, [])

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true)
    await signIn.social({
      provider,
      fetchOptions: {
        onSuccess: () => {
          toast.success(`Redirecting to ${provider} for authentication...`)
          setLastMethod(provider)
        },
        onError: ({ error }) => {
          toast.error(
            `Unable to sign in with ${provider}. ${`(${error?.message})` || "Please try again."}`
          )
          setLoading(false)
        },
      },
    })
  }

  const providers = [
    {
      Icon: GoogleIcon,
      id: "google",
      label: "Google",
      enabled: !!googleEnabled,
    },
    {
      Icon: GitHubIcon,
      id: "github",
      label: "GitHub",
      enabled: !!githubEnabled,
    },
    {
      Icon: DiscordIcon,
      iconClassName: "h-4",
      id: "discord",
      label: "Discord",
      enabled: !!discordEnabled,
    },
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {providers
        .filter((provider) => provider.enabled)
        .map(({ id, label, Icon, iconClassName }) => (
          <Button
            key={id}
            variant="outline"
            className="relative flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            onClick={async () => handleSocialSignIn(id)}
            disabled={loading}
          >
            <Icon className={iconClassName ?? "h-4 w-4"} />
            <span className="sr-only sm:not-sr-only">{label}</span>
            {lastMethod === id ? (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 px-1 py-0.5 text-[10px] leading-none"
                aria-hidden
              >
                Last used
              </Badge>
            ) : null}
          </Button>
        ))}
    </div>
  )
}
