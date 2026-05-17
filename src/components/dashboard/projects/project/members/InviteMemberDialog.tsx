"use client"

import { FullProject } from "@/actions/projects"
import { Button } from "@/components/ui/button"
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
import { useSession } from "@/lib/auth-client"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"

export default function InviteMemberDialog({
  session,
  project,
}: {
  session: ReturnType<typeof useSession>["data"]
  project: FullProject
}) {
  const router = useRouter()

  const user = session?.user

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")

  const canInviteMembers = true // TODO: Determine if the user can invite members based on their membership role
  const isLimitReached =
    project.plan.membersLimit !== null &&
    project.members.length >= project.plan.membersLimit

  const handleInviteMember = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)
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
        {(!canInviteMembers || isLimitReached) && (
          <TooltipContent>
            {!canInviteMembers
              ? "You don't have permission to invite members in this project."
              : (isLimitReached ??
                "This project has reached the maximum number of members allowed by your plan.")}
          </TooltipContent>
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
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setEmail("")
            }}
            disabled={loading}
          >
            Cancel
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
