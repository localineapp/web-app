import { getProject } from "@/actions/projects"

export default async function ProjectTranslationsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  return <></>
}
