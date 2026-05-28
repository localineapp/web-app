"use client"

import { createProjectMemberRole } from "@/actions/projects"
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
import { FullProject } from "@/types/project"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateMemberRoleDialog({
  project,
  canManageRoles,
}: {
  project: FullProject
  canManageRoles: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")

  const isLimitReached = project.memberRoles.length >= 100 // Arbitrary limit to prevent too many roles

  const handleCreateRole = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProjectMemberRole({
      projectId: project.id,
      name: name.trim(),
    })
      .then((role) => {
        toast.success(`Created role ${role.name}.`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to create role. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setName("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canManageRoles && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canManageRoles || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canManageRoles || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {(!canManageRoles || isLimitReached) && (
          <TooltipContent>
            {!canManageRoles
              ? "You don't have permission to manage roles in this project."
              : (isLimitReached ??
                "This project has reached the maximum number of roles a project can have.")}
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new role</DialogTitle>
          <DialogDescription>
            Create a new member role for this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="roleName">Name</Label>
          <Input
            id="roleName"
            type="text"
            placeholder="Enter role name"
            value={name}
            onChange={({ target: { value } }) => setName(value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setName("")
            }}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateRole}
            disabled={!name || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
