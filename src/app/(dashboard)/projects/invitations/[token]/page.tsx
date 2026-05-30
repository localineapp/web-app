import { getProjectInvitation } from "@/actions/project-invitations"
import {
  InvitationExpired,
  InvitationNotFound,
} from "@/components/dashboard/projects/invitation/InvitationAlerts"
import { toJsonSafe } from "@/lib/utils"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const invitation = await getProjectInvitation(token)

  if (!invitation) {
    return {
      title: "Invitation Not Found",
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
        <InvitationNotFound />
      </div>
    )
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="flex min-h-full flex-col">
        <InvitationExpired />
      </div>
    )
  }

  return (
    <>
      <p>{JSON.stringify(toJsonSafe(invitation))}</p>
    </>
  )
}
