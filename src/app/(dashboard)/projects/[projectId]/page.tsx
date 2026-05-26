import { getProject } from "@/actions/projects"
import MemberInfoCards from "@/components/dashboard/projects/project/MemberInfoCards"
import StatisticCards from "@/components/dashboard/projects/project/StatisticCards"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const showFirstSteps =
    project.locales.length === 0 ||
    project.terms.length === 0 ||
    project.terms.every((term) => term.translations.length === 0) ||
    project.members.length < 2

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

        <div className="col-span-full flex items-center py-4">
          <Separator className="w-full" />
        </div>

        {showFirstSteps ? (
          <div className="col-span-full grid grid-cols-2 gap-4">
            <div>
              <h2 className="mb-2 text-lg font-medium">First Steps</h2>

              <p>1. Add a locale to your project</p>
              <p>2. Add a term to your project</p>
              <p>3. Translate your first term</p>
              <p>4. Invite your team members</p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="mb-2 text-lg font-medium">Your Membership</h2>

              <MemberInfoCards session={session} project={project} />
            </div>
          </div>
        ) : (
          <div className="col-span-full flex flex-col gap-2">
            <h2 className="text-lg font-medium">Your Membership</h2>

            <MemberInfoCards session={session} project={project} />
          </div>
        )}
        {/** TODO: check layout in true and false cases of showFirstSteps */}
      </div>
    </div>
  )
}
