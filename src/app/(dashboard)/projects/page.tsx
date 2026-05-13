import CreateProjectDialog from "@/components/dashboard/projects/CreateProjectDialog"
import ProjectsList from "@/components/dashboard/projects/ProjectsList"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Projects",
}

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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
          <CreateProjectDialog session={session} />
        </div>
      </div>

      <div>
        <ProjectsList session={session} />
      </div>
    </div>
  )
}
