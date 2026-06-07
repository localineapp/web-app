import { getProject } from "@/actions/projects"
import CreateMemberRoleDialog from "@/components/dashboard/projects/project/settings/CreateMemberRoleDialog"
import MemberRolesTable from "@/components/dashboard/projects/project/settings/MemberRolesTable"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectMemberRoleSettingsPage({
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

  const canManageRoles =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_ROLES
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

  const roles = project.memberRoles.sort((a, b) => {
    if (a.id === project.id) return -1
    if (b.id === project.id) return 1

    return Number(b.permissions) - Number(a.permissions)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            <p className="text-muted-foreground">
              Manage the roles for your project&rsquo;s members.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <CreateMemberRoleDialog
            project={project}
            canManageRoles={canManageRoles}
          />
        </div>
      </div>

      <div>
        <MemberRolesTable
          project={project}
          memberRoles={roles}
          canManageRoles={canManageRoles}
        />
      </div>
    </div>
  )
}
