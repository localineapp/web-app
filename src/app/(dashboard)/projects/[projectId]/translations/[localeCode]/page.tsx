import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import TranslationsCard from "@/components/dashboard/projects/project/translations/TranslationsCard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Translate",
}

export default async function ProjectTranslationsPage({
  params,
}: {
  params: Promise<{ localeCode: string }>
}) {
  const { localeCode } = await params

  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description="Manage translations for your project." />

      <div>
        <TranslationsCard localeCode={localeCode} />
      </div>
    </div>
  )
}
