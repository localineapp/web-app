import BackgroundPattern from "@/components/background-pattern"
import LocalineLogo from "@/components/logo"
import { KeyRoundIcon, LanguagesIcon, UsersIcon } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-muted p-10 text-foreground lg:flex">
        <BackgroundPattern />

        <div className="relative z-10 flex items-center gap-2 font-semibold">
          <LocalineLogo />
          <span className="text-xl">Localine</span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <blockquote className="space-y-4">
            <p className="text-lg">
              &ldquo;The open translation management platform that helps teams
              collaborate on localization. Simple, fast, and
              developer-friendly.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              — Manage translations across all your projects
            </footer>
          </blockquote>
        </div>
        <div className="relative z-10 mt-auto">
          <div className="flex gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="h-4 w-4" />
              <span>Multiple formats</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              <span>Team collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="h-4 w-4" />
              <span>API access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  )
}
