import { isEmailVerificationRequired, isProduction } from "@/actions/get-env"
import ToggleAdminButton from "@/components/dashboard/ToggleAdminButton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { auth } from "@/lib/auth"
import { AlertTriangleIcon } from "lucide-react"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const emailVerificationRequired = await isEmailVerificationRequired()

  const user = session?.user

  const startYear = 2026
  const currentYear = new Date().getFullYear()

  const dateRange =
    startYear === currentYear ? `${currentYear}` : `${startYear}-${currentYear}`

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <div className="flex gap-2">
          {!(await isProduction()) ? (
            <ToggleAdminButton session={session} />
          ) : null}
        </div>
      </div>

      {emailVerificationRequired && !user?.emailVerified && (
        <Alert className="max-w-2xl border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            Please verify your email address to access all features. Check your
            inbox for the verification email. If you didn&rsquo;t receive it,
            please check your spam folder or contact your administrator.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <p>Moin Moin!</p>
      </div>

      <footer className="mt-auto text-center text-sm text-muted-foreground">
        © {dateRange} Localine. All rights reserved.
      </footer>
    </div>
  )
}
