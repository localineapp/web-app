import { getLocales } from "@/actions/locales"
import CreateLocaleDialog from "@/components/dashboard/admin/locales/CreateLocaleDialog"
import ImportLocalesDialog from "@/components/dashboard/admin/locales/ImportLocalesDialog"
import LocalesTable from "@/components/dashboard/admin/locales/LocalesTable"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function AdminLocalesPage() {
  const [session, locales] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    getLocales({
      includeDisabled: true,
    }),
  ])

  const user = session?.user

  const [canCreateLocales, canUpdateLocales, canDeleteLocales] = (
    await Promise.all([
      auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user?.role ?? "user",
          permissions: {
            locales: ["create"],
          },
        },
      }),
      auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            locales: ["update"],
          },
        },
      }),
      auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            locales: ["delete"],
          },
        },
      }),
    ])
  ).map((result) => result.success)

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
          <ImportLocalesDialog canCreateLocales={canCreateLocales} />
          <CreateLocaleDialog canCreateLocales={canCreateLocales} />
        </div>
      </div>

      <div>
        <LocalesTable
          locales={locales}
          canCreateLocales={canCreateLocales}
          canUpdateLocales={canUpdateLocales}
          canDeleteLocales={canDeleteLocales}
        />
      </div>
    </div>
  )
}
