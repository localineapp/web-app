import { getAppName } from "@/actions/get-env"
import { getProjects } from "@/actions/projects"
import AppHeader from "@/components/dashboard/AppHeader"
import AppSidebar from "@/components/dashboard/AppSidebar"
import { SessionProvider } from "@/components/session-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [appName, session, projects] = await Promise.all([
    getAppName(),
    auth.api.getSession({
      headers: await headers(),
    }),
    getProjects({
      includeAll: false,
    }),
  ])

  const user = session?.user
  const isImpersonating = session?.session.impersonatedBy !== null

  return (
    <div className="flex h-screen overflow-hidden">
      <SessionProvider session={session}>
        <SidebarProvider>
          <AppSidebar appName={appName} />

          <div className="flex flex-1 flex-col overflow-hidden">
            <AppHeader
              user={user}
              isImpersonating={isImpersonating}
              projects={projects}
            />

            <main className="flex-1 overflow-auto bg-muted/30 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </SessionProvider>
    </div>
  )
}
