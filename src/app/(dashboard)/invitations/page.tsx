import { getUsersProjectInvitations } from "@/actions/project-invitations"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invitations",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function InvitationsPage() {
  const invitations = await getUsersProjectInvitations()

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
        <p>Nix hier jetzt</p>
      </div>
    </div>
  )
}
