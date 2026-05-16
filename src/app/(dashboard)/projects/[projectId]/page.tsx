import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Project {projectId}
        </h1>

        <div className="flex gap-2"></div>
      </div>

      <div>
        <p>Moin Moin {session?.user?.name}!</p>
      </div>
    </div>
  )
}
