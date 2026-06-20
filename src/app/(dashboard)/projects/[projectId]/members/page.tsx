import { getProjectMembers } from "@/actions/project-members"
import InvitationsDialog from "@/components/dashboard/projects/project/members/InvitationsDialog"
import InviteMemberDialog from "@/components/dashboard/projects/project/members/InviteMemberDialog"
import MembersTable from "@/components/dashboard/projects/project/members/MembersTable"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Members",
}

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const projectMembers = await getProjectMembers({ projectId })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description="Manage the members for your project." />

        <div className="flex gap-2">
          <InvitationsDialog />
          <InviteMemberDialog />
        </div>
      </div>

      <div>
        <MembersTable members={projectMembers} />
      </div>
    </div>
  )
}
