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
import { FullProject } from "@/actions/projects"

export default function ProjectDetailsCard({
  project,
  canManageSettings,
}: {
  project: FullProject
  canManageSettings: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isNameDialogOpen, setNameDialogOpen] = useState(false)
  const [isDescriptionDialogOpen, setDescriptionDialogOpen] = useState(false)

  const [name, setName] = useState(project?.name ?? "")
  const [description, setDescription] = useState(project?.description ?? "")

  const handleUpdateName = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)
  }

  const handleUpdateDescription = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    setLoading(true)
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
                    canManageSettings ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0"
                      disabled={!canManageSettings}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  </DialogTrigger>
                </span>
              </TooltipTrigger>
              {!canManageSettings && (
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
                    canManageSettings ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0"
                      disabled={loading || !canManageSettings}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  </DialogTrigger>
                </span>
              </TooltipTrigger>
              {!canManageSettings && (
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
