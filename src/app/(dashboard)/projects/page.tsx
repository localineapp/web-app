import { getDefaultPlan } from "@/actions/plans"
import { getProjects } from "@/actions/projects"
import CreateProjectDialog from "@/components/dashboard/projects/CreateProjectDialog"
import ProjectsList from "@/components/dashboard/projects/ProjectsList"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects",
}

export default async function ProjectsPage() {
  const [projects, defaultPlan] = await Promise.all([
    getProjects({
      includeAll: false,
    }),
    getDefaultPlan(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Select a project you&rsquo;re a part of, or create a new one to get
            started.
          </p>
        </div>

        <div>
          <CreateProjectDialog
            projectCount={projects.length}
            defaultPlan={defaultPlan}
          />
        </div>
      </div>

      <div>
        <ProjectsList projects={projects} defaultPlan={defaultPlan} />
      </div>
    </div>
  )
}
