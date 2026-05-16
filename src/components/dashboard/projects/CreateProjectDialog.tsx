"use client"

import { createProject } from "@/actions/projects"
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
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateProjectDialog({
  session,
  projectCount,
}: {
  session: ReturnType<typeof useSession>["data"]
  projectCount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")

  const user = session?.user

  const projectLimit = user?.projectsLimit ?? 0
  const canCreateProject = projectCount < projectLimit

  const handleCreateProject = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProject({
      name: projectName,
      description: projectDescription || undefined,
    })
      .then(project => {
        toast.success(`Created project ${projectName} (${project.id.slice(0, 8)}).`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to create project. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setProjectName("")
        setProjectDescription("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreateProject || loading ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateProject || loading}>
              <Button
                variant="outline"
                aria-disabled={!canCreateProject || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateProject && (
          <TooltipContent>
            {projectLimit === 0
              ? "The project limit for your account is currently set to 0."
              : `You have reached your project limit (${projectCount}/${projectLimit})`}
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
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              placeholder="My Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Description (optional)</Label>
            <Input
              id="projectDescription"
              placeholder="A brief description of your project"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setProjectName("")
              setProjectDescription("")
            }}
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
