"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GitHubIcon } from "@/components/icons"
import { AlertTriangleIcon, FileTextIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardCards({
  version,
  canViewUpdateNotification,
}: {
  version: string
  canViewUpdateNotification: boolean
}) {
  const [latestRelease, setLatestRelease] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/localineapp/web-app/releases/latest",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        )

        if (!res.ok) return

        const data = await res.json()
        let tag = data.tag_name || data.name || null

        if (tag?.startsWith("v")) {
          tag = tag.slice(1)
        }

        setLatestRelease(tag)
      } catch {
        setLatestRelease(null)
      }
    }

    fetchLatestRelease()
  }, [])

  return (
    <>
      {canViewUpdateNotification &&
        latestRelease &&
        latestRelease !== version && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
            <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />

            <AlertTitle>Update available</AlertTitle>

            <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
              A newer release is available:{" "}
              <span className="font-medium">{latestRelease}</span> - you are
              running <span className="font-medium">{version}</span>. Please
              check the{" "}
              <a
                className="underline underline-offset-4"
                href="https://github.com/localineapp/web-app/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                release page
              </a>{" "}
              to update.
            </AlertDescription>
          </Alert>
        )}

      <Card
        className={
          canViewUpdateNotification &&
          latestRelease &&
          latestRelease !== version
            ? "border-red-500/40 bg-red-500/5"
            : ""
        }
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Version</CardTitle>

              <CardDescription>
                Current installed application version
              </CardDescription>
            </div>

            {canViewUpdateNotification &&
              latestRelease &&
              latestRelease !== version && (
                <Button asChild size="sm">
                  <Link
                    href="https://github.com/localineapp/web-app/releases/latest"
                    target="_blank"
                    prefetch={false}
                  >
                    Update
                  </Link>
                </Button>
              )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-4xl font-bold tracking-tight">{version}</div>

            {canViewUpdateNotification &&
              latestRelease &&
              latestRelease !== version && (
                <div className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  New version available: {latestRelease}
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader className="flex-row items-start">
            <div className="space-y-1">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <GitHubIcon width={16} />
                  GitHub
                </div>
              </CardTitle>

              <CardDescription>
                Browse the source code, releases and contribute to the project.
              </CardDescription>
            </div>

            <CardAction className="ml-auto">
              <Button asChild size="lg" variant="outline">
                <Link
                  href="https://github.com/localineapp/web-app"
                  target="_blank"
                  prefetch={false}
                >
                  Open GitHub
                </Link>
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visit the GitHub repository to explore the source code, open
              issues, contribute changes, and stay up to date with new releases.
            </p>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader className="flex-row items-start">
            <div className="space-y-1">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <FileTextIcon width={16} />
                  Documentation
                </div>
              </CardTitle>

              <CardDescription>
                Read the documentation and API reference.
              </CardDescription>
            </div>

            <CardAction className="ml-auto">
              <Button asChild size="lg">
                <Link href="https://google.com" prefetch={false}>
                  Read Documentation
                </Link>
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check the documentation for installation, configuration,
              troubleshooting, and best practices.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
