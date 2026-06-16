import { getLocales } from "@/actions/locales"
import CreateLocaleDialog from "@/components/dashboard/admin/locales/CreateLocaleDialog"
import ImportLocalesDialog from "@/components/dashboard/admin/locales/ImportLocalesDialog"
import LocalesTable from "@/components/dashboard/admin/locales/LocalesTable"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Locales",
}

export default async function AdminLocalesPage() {
  const locales = await getLocales({
    includeDisabled: true,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Locales</h1>
          <p className="text-muted-foreground">
            View and manage all locales in the system.
          </p>
        </div>

        <div className="flex gap-2">
          <ImportLocalesDialog />
          <CreateLocaleDialog />
        </div>
      </div>

      <div>
        <LocalesTable locales={locales} />
      </div>
    </div>
  )
}
