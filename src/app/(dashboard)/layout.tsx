import Header from "@/components/dashboard/header"
import Sidebar from "@/components/dashboard/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header session={session} />

        <main className="flex-1 overflow-auto bg-muted/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}