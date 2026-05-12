"use client"

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
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { useSession } from "@/lib/auth-client"
import { PlusIcon } from "lucide-react"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateProjectDialog({
  session,
}: {
  session: ReturnType<typeof useSession>["data"]
}) {
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")

  const user = session?.user

  const projectCount = 0
  const projectLimit = user?.projectsLimit ?? 0
  const canCreateProject = projectCount < projectLimit

  const handleCreateProject = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    // Simulate API call to create project
    setTimeout(() => {
      setLoading(false)
      setCreateDialogOpen(false)
      setProjectName("")
      setProjectDescription("")

      toast.info(
        "Project created successfully! (This is a demo, no actual project was created.)"
      )
    }, 2000)
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreateProject ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateProject}>
              <Button variant="outline" aria-disabled={!canCreateProject}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateProject && (
          <TooltipContent>
            You have reached your project limit ({projectCount}/{projectLimit})
          </TooltipContent>
        )}
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Add a new translation project to your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="My Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="A brief description of your project"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCreateDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateProject}
            disabled={!projectName || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
