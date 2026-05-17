import { getProject } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  ArrowLeftIcon,
  GlobeIcon,
  LibraryIcon,
  PercentIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) return <></>

  const terms = project?.terms
  const locales = project?.locales
  const members = project?.members

  const totalTranslations =
    terms?.reduce((acc, term) => acc + term.translations.length, 0) ?? 0
  const translatedCount =
    terms?.reduce(
      (acc, term) => acc + term.translations.filter((t) => t.value).length,
      0
    ) ?? 0
  const progress =
    totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Translation Progress
            </CardTitle>
            <PercentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {totalTranslations === 0 ? (
              <p className="text-muted-foreground italic">
                No translations available.
              </p>
            ) : (
              <>
                <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
                <Progress value={progress} className="mt-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {translatedCount} of {totalTranslations} translations
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Terms</CardTitle>
            <LibraryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {terms?.length === 0 ? (
              <p className="text-muted-foreground italic">
                No terms available.
              </p>
            ) : (
              <>
                <div className="text-2xl font-bold">{terms?.length}</div>
                <p>terms have been added to this project.</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Locales</CardTitle>
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {locales?.length === 0 ? (
              <p className="text-muted-foreground italic">
                No locales available.
              </p>
            ) : (
              <>
                <div className="text-2xl font-bold">{locales?.length}</div>
                <p>locales have been added to this project.</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {members?.length === 0 ? (
              <p className="text-muted-foreground italic">
                No members available.
              </p>
            ) : (
              <>
                <div className="text-2xl font-bold">{members?.length}</div>
                <p>
                  member{members?.length !== 1 ? "s are" : " is"} contributing
                  to this project.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
