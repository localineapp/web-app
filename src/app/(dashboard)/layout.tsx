import { getProjects } from "@/actions/projects"
import AppHeader from "@/components/dashboard/header"
import AppSidebar from "@/components/dashboard/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const projects = await getProjects({
    includeAll: false,
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar session={session} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader session={session} projects={projects} />

          <main className="flex-1 overflow-auto bg-muted/30 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
