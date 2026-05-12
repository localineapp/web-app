import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Public Profile",
}

export default async function PublicProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Public Profile</h1>
    </div>
  )
}
