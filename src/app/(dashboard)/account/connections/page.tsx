import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connections",
}

export default async function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
    </div>
  )
}
