import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangleIcon, HomeIcon, LogInIcon } from "lucide-react"
import Link from "next/link"

export async function AccessDeniedPage({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon />
          </EmptyMedia>

          <EmptyTitle className="text-4xl">Access Denied</EmptyTitle>

          <EmptyDescription className="text-lg">
            You don&apos;t have permission to access this resource.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
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
        </EmptyContent>
      </Empty>
    </div>
  )
}
