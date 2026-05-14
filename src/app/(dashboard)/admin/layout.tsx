import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { auth } from "@/lib/auth"
import { AlertTriangleIcon, HomeIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangleIcon />
            </EmptyMedia>
            <EmptyTitle className="text-4xl">Access Denied</EmptyTitle>
            <EmptyDescription className="text-lg">
              You don&apos;t have permission to access this section.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild size="lg">
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                Go back to dashboard
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return <>{children}</>
}
