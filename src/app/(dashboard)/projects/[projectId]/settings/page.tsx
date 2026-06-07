import { getProject } from "@/actions/projects"
import DeleteProjectCard from "@/components/dashboard/projects/project/settings/DeleteProjectCard"
import ProjectDetailsCard from "@/components/dashboard/projects/project/settings/ProjectDetailsCard"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectGeneralSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user
  const member = project.members.find((m) => m.userId === user?.id)

  const canManageSettings =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_PROJECT
    ) ||
    (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            projects: ["update"],
          },
        },
      })
    ).success

  const canDeleteProject =
    member?.roleId === project.id ||
    (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            projects: ["delete"],
          },
        },
      })
    ).success

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground">
            General settings for your project.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        <div className="w-full min-w-0 xl:flex-1">
          <ProjectDetailsCard
            project={project}
            canManageSettings={canManageSettings}
          />
        </div>
        <div className="w-full min-w-0 xl:flex-1">
          <DeleteProjectCard
            project={project}
            canDeleteProject={canDeleteProject}
          />
        </div>
      </div>
    </div>
  )
}
