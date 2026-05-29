import { isProduction } from "@/actions/get-env"
import ToggleAdminButton from "@/components/dashboard/ToggleAdminButton"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const startYear = 2026
  const currentYear = new Date().getFullYear()

  const dateRange =
    startYear === currentYear ? `${currentYear}` : `${startYear}-${currentYear}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <div className="flex gap-2">
          {!(await isProduction()) ? (
            <ToggleAdminButton session={session} />
          ) : null}
        </div>
      </div>

      <div>
        <p>Moin Moin!</p>
      </div>

      <footer className="fixed bottom-0 left-0 w-full py-3 text-center text-sm text-muted-foreground">
        © {dateRange} Localine. All rights reserved.
      </footer>
    </div>
  )
}
