"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProjectInvitation } from "@prisma/client"
import { SendIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function InvitationsDialog({
  invitations,
  canInviteMembers,
}: {
  invitations: ProjectInvitation[]
  canInviteMembers: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!canInviteMembers || loading}>
        <Button variant="outline" disabled={!canInviteMembers || loading}>
          <SendIcon className="mr-2 h-4 w-4" />
          Invitations
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-140 max-h-[calc(100dvh-4rem)] flex-col gap-0 overflow-hidden sm:max-w-230">
        <DialogHeader className="pb-4">
          <DialogTitle>Invitations</DialogTitle>
          <DialogDescription>
            View and manage pending invitations for this project. You can resend
            or revoke invitations as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-28 text-center">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="max-w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invitations.length > 0 ? (
                invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="text-center">
                      {invitation.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">
                      {invitation.email}
                    </TableCell>

                    <TableCell className="text-center">
                      {invitation.roleId}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <p>None</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No invitations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
