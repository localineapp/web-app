import { getLocales } from "@/actions/locales"
import AddLocaleDialog from "@/components/dashboard/projects/project/locales/AddLocaleDialog"
import LocalesTable from "@/components/dashboard/projects/project/locales/LocalesTable"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Locales",
}

export default async function ProjectLocalesPage() {
  const locales = await getLocales({
    includeDisabled: false,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description="Manage the locales for your project." />

        <div className="flex gap-2">
          <AddLocaleDialog locales={locales} />
        </div>
      </div>

      <div>
        <LocalesTable />
      </div>
    </div>
  )
}
