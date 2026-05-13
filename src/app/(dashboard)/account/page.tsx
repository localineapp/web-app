import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Public Profile",
}

export default async function PublicProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Public Profile</h1>
        <p className="text-muted-foreground">
          Manage your public profile information. You can also see details about your account.
        </p>
      </div>

      <div>
        <p>Not implemented</p>
      </div>
    </div>
  )
}
