"use client"

import {
  extendProjectInvitation,
  revokeProjectInvitation,
  updateProjectInvitation,
} from "@/actions/project-invitations"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import RolePickerField from "@/components/ui/custom/RolePickerField"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, formatDate } from "@/lib/utils"
import { FullProject, ProjectInvitationWithRole } from "@/types/project"
import { SendIcon, SquareArrowRightExitIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { ProjectInvitation } from "@prisma/client"

export default function InvitationsDialog({
  project,
  canInviteMembers,
}: {
  project: FullProject
  canInviteMembers: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  async function handleUpdateInvitation(
    invitation: ProjectInvitationWithRole,
    roleId: string
  ) {
    setLoading(true)

    await updateProjectInvitation({
      projectId: invitation.projectId,
      invitationId: invitation.id,
      roleId,
    })
      .then(() => {
        toast.success(
          `Updated role for ${invitation.email} (${invitation.id.slice(0, 8)}) to ${project.memberRoles.find((r) => r.id === roleId)?.name}.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            "Failed to update invitation role. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!canInviteMembers || loading}>
        <Button
          variant="outline"
          className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          disabled={!canInviteMembers || loading}
        >
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
                <TableHead>Expires at</TableHead>
                <TableHead className="max-w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {project.invitations.length > 0 ? (
                project.invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="text-center">
                      {invitation.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">
                      {invitation.email}
                    </TableCell>

                    <TableCell className="text-center">
                      <Label
                        htmlFor={`role-${invitation.id}`}
                        className="sr-only"
                      >
                        Role
                      </Label>
                      <RolePickerField
                        id={`role-${invitation.id}`}
                        roles={project.memberRoles
                          .filter((role) => role.id !== project.id)
                          .sort((a, b) => {
                            if (a.permissions !== b.permissions) {
                              return a.permissions > b.permissions ? -1 : 1
                            }

                            return a.name.localeCompare(b.name)
                          })}
                        value={invitation.role.id}
                        onChange={(roleId) => {
                          handleUpdateInvitation(invitation, roleId)
                        }}
                        disabled={loading}
                        allowNone={false}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        {formatDate(invitation.expiresAt)}
                        {invitation.expiresAt < new Date() && (
                          <Badge variant="destructive" className="ml-2">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <ResendInvitationDialog
                          invitation={invitation}
                          canInviteMembers={canInviteMembers}
                          loading={loading}
                          setLoading={setLoading}
                        />
                        <RevokeInvitationDialog
                          invitation={invitation}
                          canInviteMembers={canInviteMembers}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
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

function ResendInvitationDialog({
  invitation,
  canInviteMembers,
  loading,
  setLoading,
}: {
  invitation: ProjectInvitation
  canInviteMembers: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const isExpired = invitation.expiresAt < new Date()

  const handleResendInvitation = async (invitation: ProjectInvitation) => {
    setLoading(true)

    await extendProjectInvitation({
      projectId: invitation.projectId,
      invitationId: invitation.id,
    })
      .then(() => {
        toast.success(
          `Resent invitation for ${invitation.email} (${invitation.id.slice(0, 8)}).`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to resend invitation. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex",
            !canInviteMembers || !isExpired || loading
              ? "cursor-not-allowed"
              : ""
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="inline-flex items-center p-1 text-sm"
            disabled={!canInviteMembers || !isExpired || loading}
            onClick={() => handleResendInvitation(invitation)}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </span>
      </TooltipTrigger>
      {!canInviteMembers && (
        <TooltipContent>
          You don&rsquo;t have permission to invite members.
        </TooltipContent>
      )}
      {!isExpired && (
        <TooltipContent>
          This invitation is not expired yet. You can only resend expired
          invitations.
        </TooltipContent>
      )}
    </Tooltip>
  )
}

function RevokeInvitationDialog({
  invitation,
  canInviteMembers,
  loading,
  setLoading,
}: {
  invitation: ProjectInvitationWithRole
  canInviteMembers: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const [revokingInvitation, setRevokingInvitation] =
    useState<ProjectInvitationWithRole | null>(null)

  async function handleRevokeInvitation(invitation: ProjectInvitationWithRole) {
    setLoading(true)

    await revokeProjectInvitation({
      projectId: invitation.projectId,
      invitationId: invitation.id,
    })
      .then(() => {
        toast.success(
          `Removed invitation for ${invitation.email} (${invitation.id.slice(0, 8)}).`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to revoke invitation. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setRevokingInvitation(null)
      })
  }

  return (
    <AlertDialog
      open={!!revokingInvitation}
      onOpenChange={(open) => !open && setRevokingInvitation(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canInviteMembers || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canInviteMembers || loading}
                onClick={() => setRevokingInvitation(invitation)}
              >
                <SquareArrowRightExitIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canInviteMembers && (
          <TooltipContent>
            You don&rsquo;t have permission to invite members.
          </TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently revoke the
              invitation for {invitation.email} ({invitation.id.slice(0, 8)}).
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setRevokingInvitation(null)}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || revokingInvitation === null}
              onClick={(event) => {
                event.preventDefault()
                if (!revokingInvitation) return

                void handleRevokeInvitation(revokingInvitation)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Revoking invitation...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Revoke Invitation
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
