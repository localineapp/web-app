import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Security",
}

export default async function SecurityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Security</h1>
    </div>
  )
}
