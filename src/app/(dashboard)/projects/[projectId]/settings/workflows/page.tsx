import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workflows",
}

export default async function ProjectWorkflowSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description="Workflow settings for your project." />

      <div>
        <p>Not implemented yet.</p>
      </div>
    </div>
  )
}
