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
import { ClipboardListIcon, FileTextIcon } from "lucide-react"
import semver from "semver"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/components/session-provider"
import DashboardAlerts from "@/components/dashboard/DashboardAlerts"

function formatVersion(version: string) {
  return version.replace(/^v/, "")
}

export default function DashboardCards({
  emailVerificationRequired,
  currentVersion,
}: {
  emailVerificationRequired: boolean
  currentVersion: string
}) {
  const { user } = useSession()

  const [latestRelease, setLatestRelease] = useState<string | null>(null)
  const [changelog, setChangelog] = useState<string | null>(null)

  const canViewUpdateNotification = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      dashboard: ["updates"],
    },
  })

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/localineapp/web-app/releases",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        )

        if (!res.ok) return

        const isPrerelease =
          semver.prerelease(formatVersion(currentVersion)) !== null

        const releases = await res.json()

        const latest = releases.find(
          (release: { prerelease: boolean; tag_name: string }) =>
            (isPrerelease || !release.prerelease) &&
            semver.gt(
              formatVersion(release.tag_name),
              formatVersion(currentVersion)
            )
        )

        setLatestRelease(latest ? latest.tag_name : null)
        setChangelog(latest ? latest.body : null)
      } catch {
        setLatestRelease(null)
        setChangelog(null)
      }
    }

    if (canViewUpdateNotification) fetchLatestRelease()
  }, [currentVersion, canViewUpdateNotification])

  const hasUpdate =
    canViewUpdateNotification &&
    latestRelease !== null &&
    semver.gt(formatVersion(latestRelease), formatVersion(currentVersion))

  return (
    <>
      <DashboardAlerts
        emailVerificationRequired={emailVerificationRequired}
        hasUpdate={hasUpdate}
        latestRelease={latestRelease}
        currentVersion={currentVersion}
      />

      <Card className={hasUpdate ? "border-red-500/40 bg-red-500/5" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Version</CardTitle>
              <CardDescription>
                Current installed application version
              </CardDescription>
            </div>

            {hasUpdate && (
              <div className="flex gap-2">
                {changelog && (
                  <ChangelogDialog
                    changelog={changelog}
                    version={latestRelease!}
                  />
                )}
                <Button size="sm" asChild>
                  <Link
                    href={`https://github.com/localineapp/web-app/releases/tag/${latestRelease}`}
                    target="_blank"
                    prefetch={false}
                  >
                    Update
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-4xl font-bold tracking-tight">
              {currentVersion}
            </div>

            {hasUpdate && (
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
                <Link
                  href="https://localine.mintlify.app"
                  target="_blank"
                  prefetch={false}
                >
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

function ChangelogDialog({
  changelog,
  version,
}: {
  changelog: string
  version: string
}) {
  const [isDialogOpen, setDialogOpen] = useState(false)

  function stripGitHubAlerts(value: string) {
    return value
      .replace(/\r\n/g, "\n")
      .replace(
        /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n(?:>.*\n?)*/gm,
        ""
      )
      .replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/gm, "")
      .trim()
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Show Changelog
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-140 max-h-[calc(100dvh-4rem)] flex-col overflow-hidden sm:max-w-230">
        <DialogTitle className="flex items-center gap-2 text-3xl font-bold">
          <ClipboardListIcon />
          Changelog of {version}
        </DialogTitle>

        <DialogDescription className="hidden" />

        <div className="mt-4 overflow-y-auto rounded-md border bg-muted p-4">
          <article className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {stripGitHubAlerts(changelog)}
            </ReactMarkdown>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  )
}
