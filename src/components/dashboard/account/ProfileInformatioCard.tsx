"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BadgeAlertIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  BanIcon,
  CalendarIcon,
  CopyIcon,
  FoldersIcon,
  IdCardIcon,
  Link2Icon,
  MailIcon,
  TagIcon,
  UserCogIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function ProfileInformationCard({
  session,
}: {
  session: ReturnType<typeof useSession>["data"]
}) {
  const user = session?.user

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <IdCardIcon className="size-4" />
          <p>ID:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 font-mono text-sm break-all text-foreground">
            {user?.id.slice(0, 8)}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(user?.id ?? "")
                toast.success("User ID copied to clipboard.")
              } catch {
                toast.error("Failed to copy user ID.")
              }
            }}
            disabled={!user?.id}
          >
            <CopyIcon />
          </Button>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TagIcon className="size-4" />
          <p>Role:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-foreground">
          {user?.role === "admin" ? (
            <UserCogIcon className="size-4 shrink-0" />
          ) : (
            <UserIcon className="size-4 shrink-0" />
          )}
          <p className="min-w-0 font-mono text-sm break-all text-foreground capitalize">
            {user?.role ?? "Unknown"}
          </p>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <Link2Icon className="size-4" />
          <p>Last Login Method:</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground capitalize">
          {user?.lastLoginMethod ?? "Unknown"}
        </p>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <FoldersIcon className="size-4" />
          <p>Projects Limit:</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground">
          {!!user?.projectsLimit
            ? user.projectsLimit.toLocaleString("en-US")
            : "Unknown"}
        </p>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <MailIcon className="size-4" />
          <p>Email Verified:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-foreground">
          {user?.emailVerified ? (
            <BadgeCheckIcon className="size-4 shrink-0" />
          ) : (
            <BadgeXIcon className="size-4 shrink-0" />
          )}
          <p
            className={cn(
              "min-w-0 font-mono text-sm break-all text-foreground capitalize",
              user?.emailVerified
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {user?.emailVerified ? "Yes" : "No"}
          </p>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <BanIcon className="size-4" />
          <p>Banned:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-foreground">
          {user?.banned ? (
            <BadgeAlertIcon className="size-4 shrink-0" />
          ) : (
            <BadgeCheckIcon className="size-4 shrink-0" />
          )}
          <p
            className={cn(
              "min-w-0 font-mono text-sm break-all text-foreground capitalize",
              user?.banned
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {user?.banned ? "Yes" : "No"}
          </p>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <CalendarIcon className="size-4" />
          <p>Created at:</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground">
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleString()
            : "Unknown"}
        </p>
      </CardContent>
    </Card>
  )
}
