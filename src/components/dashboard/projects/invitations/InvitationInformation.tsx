"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { generateRoleBadge } from "@/lib/project-utils"
import { cn, formatDate } from "@/lib/utils"
import { ProjectInvitationWithProjectAndRole } from "@/types/project"
import { CalendarIcon, CheckIcon, HashIcon, XIcon } from "lucide-react"
import { ProjectInvitation } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { MouseEvent, useState } from "react"
import {
  acceptProjectInvitation,
  declineProjectInvitation,
} from "@/actions/project-invitations"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function InvitationInformation({
  invitation,
}: {
  invitation: ProjectInvitationWithProjectAndRole
}) {
  const [loading, setLoading] = useState(false)

  return (
    <Card className="gap-0 border-border/60 bg-card/80 py-0 shadow-2xl shadow-black/5 backdrop-blur">
      <CardHeader className="space-y-4 border-b border-border/60 bg-muted/30 px-6 py-6 sm:px-8">
        <CardTitle className="text-2xl leading-none">
          {invitation.project.name}
        </CardTitle>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <HashIcon className="h-4 w-4" />
            Project ID:{" "}
            <span className="font-medium text-foreground">
              {invitation.project.id.slice(0, 8)}
            </span>
          </span>

          <Separator orientation="vertical" className="hidden h-4 sm:block" />

          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            Invited:{" "}
            <span className="font-medium text-foreground">
              {formatDate(invitation.createdAt)}
            </span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          <section className="space-y-4">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Description
              </p>
              <p
                className={cn(
                  "mt-2 text-sm leading-7 text-foreground/90 sm:text-base",
                  !invitation.project.description && "text-foreground/60 italic"
                )}
              >
                {invitation.project.description?.trim() ||
                  "This project does not have a description."}
              </p>
            </div>
          </section>

          <aside className="space-y-4 rounded-2xl border border-border/60 bg-background/80 p-4 lg:col-start-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Invitation details
              </h3>

              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Project name</dt>
                  <dd className="text-right font-medium text-foreground">
                    {invitation.project.name}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Your role</dt>
                  <dd className="text-right font-medium text-foreground">
                    {generateRoleBadge(
                      invitation.role.name,
                      invitation.role.color ?? undefined,
                      invitation.role.icon ?? undefined
                    )}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Invited on</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formatDate(invitation.createdAt)}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Expires on</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formatDate(invitation.expiresAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          <footer className="flex items-center gap-4">
            <AcceptInvitationButton
              invitation={invitation}
              loading={loading}
              setLoading={setLoading}
            />
            <DeclineInvitationButton
              invitation={invitation}
              loading={loading}
              setLoading={setLoading}
            />
          </footer>
        </div>
      </CardContent>
    </Card>
  )
}

function AcceptInvitationButton({
  invitation,
  loading,
  setLoading,
}: {
  invitation: ProjectInvitation
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const handleAcceptInvitation = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    setLoading(true)

    await acceptProjectInvitation({ token: invitation.token })
      .then((invitation) => {
        toast.success(
          `You have accepted the invitation to join ${invitation.project.name}.`
        )

        router.refresh()
        router.push(`/projects/${invitation.project.id}`)
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to accept invitation. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Button
      className="disabled:pointer-events-auto disabled:cursor-not-allowed"
      size="lg"
      disabled={loading}
      onClick={handleAcceptInvitation}
    >
      <CheckIcon className="h-4 w-4" />
      Accept Invitation
    </Button>
  )
}

function DeclineInvitationButton({
  invitation,
  loading,
  setLoading,
}: {
  invitation: ProjectInvitation
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const handleDeclineInvitation = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    setLoading(true)

    await declineProjectInvitation({ token: invitation.token })
      .then((invitation) => {
        toast.success(
          `You have declined the invitation to join ${invitation.project.name}.`
        )

        router.refresh()
        router.push("/projects/invitations")
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to decline invitation. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Button
      className="disabled:pointer-events-auto disabled:cursor-not-allowed"
      variant="destructive"
      size="lg"
      disabled={loading}
      onClick={handleDeclineInvitation}
    >
      <>
        <XIcon className="h-4 w-4" />
        Decline Invitation
      </>
    </Button>
  )
}
