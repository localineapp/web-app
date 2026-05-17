import { getProject } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default async function ProjectTranslationsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground">
            Add translations to the terms for your project.
          </p>
        </div>
      </div>

      <div>
        <p>Not implemented yet.</p>
      </div>
    </div>
  )
}
