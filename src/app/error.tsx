"use client"

import { BackgroundPattern } from "@/components/background-pattern"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  AlertTriangleIcon,
  HomeIcon,
  LogInIcon,
  RefreshCwIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted">
      <BackgroundPattern />

      <div className="relative z-10 space-y-8 px-4 text-center">
        <div className="mb-8 inline-flex items-center gap-2 font-semibold">
          <Image
            src="/logo.png"
            alt="Localine Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-2xl">Localine</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <AlertTriangleIcon className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-8xl font-bold text-muted-foreground">500</h1>
          </div>
          <h2 className="text-3xl font-semibold">An Error Occurred</h2>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Sorry, an unexpected error has occurred. Please try refreshing the
            page or contact your administrator if the problem persists.
          </p>

          <details className="mt-4 text-left text-sm text-muted-foreground">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4">
              {error.message}
              {error.digest && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Error Digest: {error.digest}
                </div>
              )}
            </pre>
          </details>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button variant="outline" size="lg" onClick={() => unstable_retry()}>
            <RefreshCwIcon className="mr-2 h-5 w-5" />
            Retry
          </Button>
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                Go back to dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signin">
                <LogInIcon className="mr-2 h-5 w-5" />
                Sign into your account
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
