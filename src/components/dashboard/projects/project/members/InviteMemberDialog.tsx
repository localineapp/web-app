"use client"

import { createProjectInvitation } from "@/actions/project-invitations"
import { useProject } from "@/components/project-provider"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import RolePickerField from "@/components/ui/custom/RolePickerField"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function InviteMemberDialog() {
  const router = useRouter()
  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState("")

  const canInviteMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.INVITE_MEMBERS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const isLimitReached =
    project.plan.membersLimit !== null &&
    project.members.length >= project.plan.membersLimit

  const handleInviteMember = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    if (!roleId) {
      toast.error("Please select a role for the new member.")
      setLoading(false)
      return
    }

    await createProjectInvitation({
      projectId: project.id,
      email: email.trim(),
      roleId,
    })
      .then(() => {
        toast.success(`Invitation sent to ${email}.`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || `Failed to invite ${email}. Please try again.`
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setEmail("")
        setRoleId("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canInviteMembers && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canInviteMembers || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canInviteMembers || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canInviteMembers ? (
          <TooltipContent>
            You don&rsquo;t have permission to invite members in this project.
          </TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {project.plan.membersLimit === 0
                ? "Your current plan does not allow inviting members."
                : `This project has reached the maximum number of members allowed by your plan (${project.members.length}/${project.plan.membersLimit}).`}
            </TooltipContent>
          )
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite new member</DialogTitle>
          <DialogDescription>
            Add a new member to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <RolePickerField
            id="role"
            roles={project.memberRoles
              .filter((role) => role.id !== project.id)
              .sort((a, b) => {
                if (a.permissions !== b.permissions) {
                  return a.permissions > b.permissions ? -1 : 1
                }

                return a.name.localeCompare(b.name)
              })}
            value={roleId}
            onChange={setRoleId}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setEmail("")
              setRoleId("")
            }}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleInviteMember}
            disabled={!email || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Inviting...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
