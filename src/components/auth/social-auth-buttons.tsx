"use client"

import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { DiscordIcon, GitHubIcon, GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SocialAuthButtons() {
  const [lastMethod, setLastMethod] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastMethod(authClient.getLastUsedLoginMethod())
  }, [])

  const providers = [
    {
      Icon: GoogleIcon,
      id: "google",
      label: "Google",
    },
    {
      Icon: GitHubIcon,
      id: "github",
      label: "GitHub",
    },
    {
      Icon: DiscordIcon,
      iconClassName: "size-discord h-4 w-7",
      id: "discord",
      label: "Discord",
    },
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {providers.map(({ id, label, Icon, iconClassName }) => (
        <Button
          key={id}
          variant="outline"
          className="relative flex items-center justify-center gap-2"
          onClick={() => authClient.signIn.social({ provider: id })}
          aria-label={label}
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