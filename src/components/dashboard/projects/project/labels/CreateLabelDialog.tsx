"use client"

import { createProjectLabel } from "@/actions/projects"
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

export default function CreateLabelDialog({
  project,
  canManageLabels,
}: {
  project: FullProject
  canManageLabels: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState<string | null>(null)

  const isLimitReached =
    project.plan.labelsLimit !== null &&
    project.labels.length >= project.plan.labelsLimit

  const handleCreateLabel = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProjectLabel({
      projectId: project.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
      .then((label) => {
        toast.success(`Created label ${label.name}.`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to create label. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setName("")
        setDescription(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canManageLabels && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canManageLabels || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canManageLabels || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Label
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {(!canManageLabels || isLimitReached) && (
          <TooltipContent>
            {!canManageLabels
              ? "You don't have permission to create labels in this project."
              : (isLimitReached ??
                "This project has reached the maximum number of labels allowed by your plan.")}
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new label</DialogTitle>
          <DialogDescription>
            Add a new label to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="labelName">Label name</Label>
            <Input
              id="labelName"
              placeholder="My Label"
              value={name}
              onChange={({ target: { value } }) => setName(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labelDescription">Description (optional)</Label>
            <Input
              id="labelDescription"
              placeholder="A brief description of your label"
              value={description ?? ""}
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setName("")
              setDescription(null)
            }}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateLabel}
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
                Create Label
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
