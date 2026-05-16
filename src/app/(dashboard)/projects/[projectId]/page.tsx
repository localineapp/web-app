import { getProject } from "@/actions/projects"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Project {project?.name || projectId}
        </h1>

        <div className="flex gap-2"></div>
      </div>

      <div>
        <p>Moin Moin!</p>
      </div>
    </div>
  )
}
