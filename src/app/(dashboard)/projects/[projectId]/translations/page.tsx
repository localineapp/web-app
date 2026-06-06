import { getProject } from "@/actions/projects"
import LocalesCards from "@/components/dashboard/projects/project/translations/LocalesCards"
import NoLocalesEmpty from "@/components/dashboard/projects/project/translations/NoLocalesEmpty"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectTranslationsPage({
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

  const user = session?.user
  const member = project.members.find((m) => m.userId === user?.id)

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
            Select the locale you want to view or edit translations for.
          </p>
        </div>
      </div>

      <div>
        {project.locales.length === 0 ? (
          <NoLocalesEmpty />
        ) : (
          <LocalesCards projectLocales={project.locales} member={member} />
        )}
      </div>
    </div>
  )
}
