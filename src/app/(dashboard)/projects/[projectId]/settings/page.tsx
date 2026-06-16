import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import DeleteProjectCard from "@/components/dashboard/projects/project/settings/DeleteProjectCard"
import ProjectDetailsCard from "@/components/dashboard/projects/project/settings/ProjectDetailsCard"

export default async function ProjectGeneralSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description="General settings for your project." />

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        <div className="w-full min-w-0 xl:flex-1">
          <ProjectDetailsCard />
        </div>
        <div className="w-full min-w-0 xl:flex-1">
          <DeleteProjectCard />
        </div>
      </div>
    </div>
  )
}
