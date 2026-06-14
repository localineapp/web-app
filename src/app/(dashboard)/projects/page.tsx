import { getDefaultPlan } from "@/actions/plans"
import { getProjects } from "@/actions/projects"
import CreateProjectDialog from "@/components/dashboard/projects/CreateProjectDialog"
import ProjectsList from "@/components/dashboard/projects/ProjectsList"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Projects",
}

export default async function ProjectsPage() {
  const [session, projects, defaultPlan] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    getProjects({
      includeAll: false,
    }),
    getDefaultPlan(),
  ])

  const user = session?.user

  const projectLimit = user?.projectsLimit ?? 0

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
            projectLimit={projectLimit}
            projectCount={projects.length}
            defaultPlan={defaultPlan}
          />
        </div>
      </div>

      <div>
        <ProjectsList
          user={user}
          projects={projects}
          defaultPlan={defaultPlan}
        />
      </div>
    </div>
  )
}
