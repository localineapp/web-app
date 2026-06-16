import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import LocalesCards from "@/components/dashboard/projects/project/translations/LocalesCards"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Translations",
}

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
