import { getProjectInvitation } from "@/actions/project-invitations"
import BackgroundPattern from "@/components/background-pattern"
import InvitationInformation from "@/components/dashboard/projects/invitations/InvitationInformation"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangleIcon, CalendarClockIcon, HomeIcon } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const invitation = await getProjectInvitation(token)

  if (!invitation) {
    return {
      title: "Invitation",
      robots: "noindex",
    }
  }

  return {
    title: `Invited to ${invitation.project.name} | Localine`,
    robots: "noindex",
  }
}

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invitation = await getProjectInvitation(token)

  if (!invitation) {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangleIcon />
            </EmptyMedia>

            <EmptyTitle className="text-4xl">Invitation Not Found</EmptyTitle>

            <EmptyDescription className="text-lg">
              The invitation you are looking for does not exist.
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

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClockIcon />
            </EmptyMedia>

            <EmptyTitle className="text-4xl">Invitation Expired</EmptyTitle>

            <EmptyDescription className="text-lg">
              This invitation has expired and can no longer be accepted.
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

  return (
    <main className="relative flex min-h-full overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_38%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.22)_100%)]">
      <BackgroundPattern />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              You have been invited to {invitation.project.name}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              Review the project details, confirm the access role you will get,
              and check the invitation timeline before accepting.
            </p>
          </div>

          <InvitationInformation invitation={invitation} />
        </div>
      </div>
    </main>
  )
}
