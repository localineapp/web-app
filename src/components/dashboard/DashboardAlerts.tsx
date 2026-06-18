import { useSession } from "@/components/session-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangleIcon } from "lucide-react"

export default function DashboardAlerts({
  emailVerificationRequired,
  hasUpdate,
  latestRelease,
  currentVersion,
}: {
  emailVerificationRequired: boolean
  hasUpdate: boolean
  latestRelease: string | null
  currentVersion: string
}) {
  const { user } = useSession()

  return (
    <>
      {emailVerificationRequired && !user?.emailVerified && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />

          <AlertTitle>Email Verification Required</AlertTitle>

          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            Please verify your email address to access all features. Check your
            inbox for the verification email. If you didn&rsquo;t receive it,
            please check your spam folder or contact your administrator.
          </AlertDescription>
        </Alert>
      )}

      {hasUpdate && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
          <AlertTitle>Update available</AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            A newer release is available:{" "}
            <span className="font-medium">{latestRelease}</span> - you are
            running <span className="font-medium">{currentVersion}</span>.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
