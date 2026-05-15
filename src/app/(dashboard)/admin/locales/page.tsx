import { getLocales } from "@/actions/locales"
import CreateLocaleDialog from "@/components/dashboard/admin/locales/CreateLocaleDialog"
import ImportLocalesDialog from "@/components/dashboard/admin/locales/ImportLocalesDialog"
import LocalesTable from "@/components/dashboard/admin/locales/LocalesTable"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function AdminLocalesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const locales = await getLocales({ session, includeDisabled: true })

  const canCreateLocale = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - session?.user.role can be undefined, but the API expects a string.
        role: session?.user.role ?? "user",
        permissions: {
          locales: ["create"],
        },
      },
    })
  ).success
  const canUpdateLocales = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - session?.user.role can be undefined, but the API expects a string.
        role: session?.user.role ?? "user",
        permissions: {
          locales: ["update"],
        },
      },
    })
  ).success
  const canDeleteLocales = (
    await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        // @ts-expect-error - session?.user.role can be undefined, but the API expects a string.
        role: session?.user.role ?? "user",
        permissions: {
          locales: ["delete"],
        },
      },
    })
  ).success

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
          <ImportLocalesDialog canCreateLocale={canCreateLocale} />
          <CreateLocaleDialog canCreateLocale={canCreateLocale} />
        </div>
      </div>

      <div>
        <LocalesTable
          locales={locales}
          canUpdateLocales={canUpdateLocales}
          canDeleteLocales={canDeleteLocales}
        />
      </div>
    </div>
  )
}
