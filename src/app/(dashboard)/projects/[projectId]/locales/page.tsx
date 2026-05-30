import { getLocales } from "@/actions/locales"
import { getProject } from "@/actions/projects"
import AddLocaleDialog from "@/components/dashboard/projects/project/locales/AddLocaleDialog"
import LocalesTable from "@/components/dashboard/projects/project/locales/LocalesTable"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { ProjectLocaleWithLocale } from "@/types/project"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectLocalesPage({
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

  const canManageLocales =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_LOCALES
    ) ||
    (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            projects: ["update"],
          },
        },
      })
    ).success

  const locales = await getLocales({
    includeDisabled: false,
  })

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
            <p className="text-muted-foreground">
              Manage the locales for your project.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <AddLocaleDialog
            project={project}
            locales={locales}
            canManageLocales={canManageLocales}
          />
        </div>
      </div>

      <div>
        <LocalesTable
          projectLocales={project.locales as ProjectLocaleWithLocale[]}
          canManageLocales={canManageLocales}
        />
      </div>
    </div>
  )
}
