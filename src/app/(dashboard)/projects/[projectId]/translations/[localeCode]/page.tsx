import { getProject } from "@/actions/projects"
import NoLocalesEmpty from "@/components/dashboard/projects/project/translations/NoLocalesEmpty"
import TranslationsCard from "@/components/dashboard/projects/project/translations/TranslationsCard"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { auth } from "@/lib/auth"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { AlertTriangleIcon, ArrowLeftIcon, UndoDotIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectTranslationsPage({
  params,
}: {
  params: Promise<{ projectId: string; localeCode: string }>
}) {
  const { projectId, localeCode } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  const locale = project.locales.find((l) => l.locale.code === localeCode)

  if (!locale) {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangleIcon />
            </EmptyMedia>

            <EmptyTitle className="text-4xl">Locale Not Found</EmptyTitle>

            <EmptyDescription className="text-lg">
              The locale you are looking for does not exist in this project.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild size="lg">
              <Link href={`/projects/${projectId}/translations`}>
                <UndoDotIcon className="mr-2 h-5 w-5" />
                Go back
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user
  const member = project.members.find((m) => m.userId === user?.id)

  const canTranslate =
    !member ||
    (hasPermission(member.role.permissions, ProjectPermission.TRANSLATE) &&
      (member.locales.length === 0 ||
        member.locales.some((ml) => ml.localeId === locale.id)))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${projectId}/translations`}>
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
        {project.locales.length === 0 ? (
          <NoLocalesEmpty />
        ) : (
          <TranslationsCard
            project={project}
            locale={locale}
            canTranslate={canTranslate}
          />
        )}
      </div>
    </div>
  )
}
