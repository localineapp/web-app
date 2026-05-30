import { getProjectInvitations } from "@/actions/project-invitations"
import InvitationsTable from "@/components/dashboard/projects/invitation/InvitationsTable"
import { decrypt } from "@/lib/crypto"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invitations",
}

export default async function InvitationsPage() {
  const invitations = await getProjectInvitations({ includeExpired: false })

  const invitationsWithDecryptedTokens = await Promise.all(
    invitations.map(async (invitation) => ({
      ...invitation,
      token: decrypt(invitation.token),
    }))
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          View your pending invitations to join projects and accept or decline
          them.
        </p>
      </div>

      <div>
        <InvitationsTable invitations={invitationsWithDecryptedTokens} />
      </div>
    </div>
  )
}
