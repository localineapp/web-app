import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import CreateMemberRoleDialog from "@/components/dashboard/projects/project/settings/CreateMemberRoleDialog"
import MemberRolesTable from "@/components/dashboard/projects/project/settings/MemberRolesTable"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Member Roles",
}

export default async function ProjectMemberRoleSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description="Manage member roles for your project." />

        <div className="flex gap-2">
          <CreateMemberRoleDialog />
        </div>
      </div>

      <div>
        <MemberRolesTable />
      </div>
    </div>
  )
}
