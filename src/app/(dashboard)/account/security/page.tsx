import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Security",
}

export default async function SecurityPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your security settings and preferences.
        </p>
      </div>

      <div>
        <p>Not implemented</p>
      </div>
    </div>
  )
}
