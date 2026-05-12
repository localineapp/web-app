import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sessions",
}

export default async function SessionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
    </div>
  )
}
