import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import LocalesCards from "@/components/dashboard/projects/project/translations/LocalesCards"

export default async function ProjectTranslationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description="Manage translations for your project." />

      <div>
        <LocalesCards />
      </div>
    </div>
  )
}
