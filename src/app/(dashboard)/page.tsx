import {
  isEmailVerificationRequired,
  isProduction,
  getVersion,
} from "@/actions/get-env"
import ToggleAdminButton from "@/components/dashboard/ToggleAdminButton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { auth } from "@/lib/auth"
import { AlertTriangleIcon } from "lucide-react"
import { Metadata } from "next"
import { headers } from "next/headers"
import DashboardCards from "@/components/dashboard/DashboardCards"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const emailVerificationRequired = await isEmailVerificationRequired()

  const user = session?.user
  const canViewUpdateNotification = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: user?.role ?? "user",
        permissions: {
          dashboard: ["updates"],
        },
      },
    })
  ).success

  const startYear = 2026
  const currentYear = new Date().getFullYear()

  const dateRange =
    startYear === currentYear ? `${currentYear}` : `${startYear}-${currentYear}`

  const version = await getVersion()

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto flex w-full flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

            <p className="mt-1 text-muted-foreground">
              Look forward to the latest features and improvements of Localine.
            </p>
          </div>

          {!(await isProduction()) && <ToggleAdminButton session={session} />}
        </div>

        {emailVerificationRequired && !user?.emailVerified && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
            <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />

            <AlertTitle>Email Verification Required</AlertTitle>

            <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
              Please verify your email address to access all features. Check
              your inbox for the verification email. If you didn&rsquo;t receive
              it, please check your spam folder or contact your administrator.
            </AlertDescription>
          </Alert>
        )}

        <DashboardCards
          version={version}
          canViewUpdateNotification={canViewUpdateNotification}
        />

        <footer className="mt-auto border-t pt-6 text-center text-sm text-muted-foreground">
          © {dateRange} Localine. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
