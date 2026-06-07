import { getProjectMembers } from "@/actions/project-members"
import { getProject } from "@/actions/projects"
import InvitationsDialog from "@/components/dashboard/projects/project/members/InvitationsDialog"
import InviteMemberDialog from "@/components/dashboard/projects/project/members/InviteMemberDialog"
import MembersTable from "@/components/dashboard/projects/project/members/MembersTable"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectMembersPage({
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

  const canInviteMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.INVITE_MEMBERS
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

  const canUpdateMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.UPDATE_MEMBERS
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

  const canRemoveMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.REMOVE_MEMBERS
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

  const projectMembers = await getProjectMembers({ projectId })
  const filteredProjectMembers = projectMembers.map((projectMember) => ({
    ...projectMember,
    user: {
      ...projectMember.user,
      email:
        canInviteMembers || canUpdateMembers || canRemoveMembers
          ? projectMember.user.email
          : "hidden@localine.app",
    },
  }))

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
              Manage the members for your project.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <InvitationsDialog
            project={project}
            canInviteMembers={canInviteMembers}
          />
          <InviteMemberDialog
            project={project}
            canInviteMembers={canInviteMembers}
          />
        </div>
      </div>

      <div>
        <MembersTable
          session={session}
          project={project}
          projectMembers={filteredProjectMembers}
          canUpdateMembers={canUpdateMembers}
          canRemoveMembers={canRemoveMembers}
        />
      </div>
    </div>
  )
}
