import { getPlans } from "@/actions/plans"
import { getProjects } from "@/actions/projects"
import ProjectsTable from "@/components/dashboard/admin/ProjectsTable"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Projects",
}

export default async function AdminProjectsPage() {
  const projects = await getProjects({
    includeAll: true,
  })

  const plans = await getPlans()

  const canUpdatePlan = (
    await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permissions: {
          projects: ["update-plan"],
        },
      },
    })
  ).success

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          View and manage all projects in the system.
        </p>
      </div>

      <div>
        <ProjectsTable
          projects={projects}
          plans={plans}
          canUpdatePlan={canUpdatePlan}
        />
      </div>
    </div>
  )
}
