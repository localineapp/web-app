import { getProjects } from "@/actions/projects"
import ProjectsTable from "@/components/dashboard/admin/ProjectsTable"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects",
}

export default async function AdminProjectsPage() {
  const projects = await getProjects({
    includeAll: true,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          View and manage all projects in the system.
        </p>
      </div>

      <div>
        <ProjectsTable projects={projects} />
      </div>
    </div>
  )
}
