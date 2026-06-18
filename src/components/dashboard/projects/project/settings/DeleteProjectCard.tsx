"use client"

import { deleteProject } from "@/actions/projects"
import { useProject } from "@/components/project-provider"
import { useSession } from "@/components/session-provider"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function DeleteProjectCard() {
  const router = useRouter()
  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const canDeleteProject =
    member?.roleId === project.id ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["delete"],
      },
    })

  const handleDeleteAccount = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await deleteProject(project)
      .then(() => {
        toast.success(
          `Deleted project ${project.name} (${project.id.slice(0, 8)}).`
        )
        router.push("/projects")
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to delete project. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
      })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Delete Project</CardTitle>
        <CardDescription>
          Once you delete your project, there is no going back. Deleting your
          project will remove all attached data from the system.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex",
                  !canDeleteProject || loading ? "cursor-not-allowed" : ""
                )}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={loading || !canDeleteProject}
                  >
                    <TrashIcon className="me-1" />
                    Delete Project
                  </Button>
                </AlertDialogTrigger>
              </span>
            </TooltipTrigger>
            {!canDeleteProject && (
              <TooltipContent>
                Only the project owner can delete this project.
              </TooltipContent>
            )}
          </Tooltip>

          <AlertDialogPortal>
            <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your project and remove your data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </AlertDialogCancel>

                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Deleting project...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      Delete project
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
