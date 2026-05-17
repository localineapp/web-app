import { getProject } from "@/actions/projects"
import StatisticCards from "@/components/dashboard/projects/project/StatisticCards"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            <p
              className={cn(
                "text-muted-foreground",
                !project?.description && "italic"
              )}
            >
              {project?.description ?? "No description."}
            </p>
          </div>
        </div>

        <div className="flex gap-2"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatisticCards project={project} />
      </div>
    </div>
  )
}
