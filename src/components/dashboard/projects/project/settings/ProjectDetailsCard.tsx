"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PackageIcon, PencilIcon, TagIcon, TextIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { updateProject } from "@/actions/projects"
import { toast } from "sonner"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { authClient } from "@/lib/auth-client"
import { useProject } from "@/components/project-provider"
import { useSession } from "@/components/session-provider"

export default function ProjectDetailsCard() {
  const router = useRouter()
  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isNameDialogOpen, setNameDialogOpen] = useState(false)
  const [isDescriptionDialogOpen, setDescriptionDialogOpen] = useState(false)

  const [name, setName] = useState(project?.name ?? "")
  const [description, setDescription] = useState(project?.description ?? "")

  const canManageProject =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_PROJECT
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const handleUpdateName = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await updateProject({
      projectId: project.id,
      name: name.trim(),
    })
      .then((project) => {
        toast.success(`Updated project name to ${project?.name}.`)
        router.refresh()
        setName(project?.name ?? "")
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update project name. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setNameDialogOpen(false)
      })
  }

  const handleUpdateDescription = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    setLoading(true)

    await updateProject({
      projectId: project.id,
      description: description.trim(),
    })
      .then((project) => {
        toast.success(`Updated project description.`)
        router.refresh()
        setDescription(project?.description ?? "")
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            "Failed to update project description. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDescriptionDialogOpen(false)
      })
  }

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TagIcon className="size-4" />
          <p>Name:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 font-mono text-sm break-all text-foreground">
            {project?.name ?? "Unknown"}
          </p>
          <Dialog open={isNameDialogOpen} onOpenChange={setNameDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex",
                    !canManageProject || loading ? "cursor-not-allowed" : ""
                  )}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0"
                      disabled={!canManageProject || loading}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  </DialogTrigger>
                </span>
              </TooltipTrigger>
              {!canManageProject && (
                <TooltipContent>
                  You don&rsquo;t have permission to change this project&rsquo;s
                  name.
                </TooltipContent>
              )}
            </Tooltip>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit name</DialogTitle>
                <DialogDescription>
                  Update the public name shown on your profile.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  placeholder="Enter your name"
                  disabled={loading}
                  minLength={1}
                  maxLength={32}
                  required
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNameDialogOpen(false)}
                  disabled={loading}
                >
                  Close
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUpdateName}
                  disabled={
                    !name.trim() ||
                    name.trim() === project?.name?.trim() ||
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TextIcon className="size-4" />
          <p>Description:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              "max-w-80 min-w-0 font-mono text-sm wrap-break-word text-foreground",
              !project?.description && "text-muted-foreground italic"
            )}
          >
            {project?.description ?? "None"}
          </p>
          <Dialog
            open={isDescriptionDialogOpen}
            onOpenChange={setDescriptionDialogOpen}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex",
                    !canManageProject || loading ? "cursor-not-allowed" : ""
                  )}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0"
                      disabled={!canManageProject || loading}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  </DialogTrigger>
                </span>
              </TooltipTrigger>
              {!canManageProject && (
                <TooltipContent>
                  You don&rsquo;t have permission to change this project&rsquo;s
                  description.
                </TooltipContent>
              )}
            </Tooltip>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit description</DialogTitle>
                <DialogDescription>
                  Update the public description shown on your profile.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="min-h-24 resize-none"
                  value={description}
                  placeholder="Enter your description"
                  disabled={loading}
                  minLength={1}
                  maxLength={255}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDescriptionDialogOpen(false)}
                  disabled={loading}
                >
                  Close
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUpdateDescription}
                  disabled={
                    description.trim() === project?.description?.trim() ||
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <PackageIcon className="size-4" />
          <p>Plan:</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground capitalize">
          {project.plan.displayName ?? "Unknown"}
        </p>
      </CardContent>
    </Card>
  )
}
