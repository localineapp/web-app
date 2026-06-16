import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import CreateTermDialog from "@/components/dashboard/projects/project/terms/CreateTermDialog"
import TermsTable from "@/components/dashboard/projects/project/terms/TermsTable"

export default async function ProjectTermsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description="Manage terms for your project." />

        <div className="flex gap-2">
          <CreateTermDialog />
        </div>
      </div>

      <div>
        <TermsTable />
      </div>
    </div>
  )
}
