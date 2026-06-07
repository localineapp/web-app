import { getProject } from "@/actions/projects"
import CreateTermDialog from "@/components/dashboard/projects/project/terms/CreateTermDialog"
import TermsTable from "@/components/dashboard/projects/project/terms/TermsTable"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { ArrowLeftIcon } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

export default async function ProjectTermsPage({
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

  const canCreateTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.CREATE_TERMS
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

  const canLockTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.LOCK_TERMS
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

  const canUpdateTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.UPDATE_TERMS
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

  const canDeleteTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.DELETE_TERMS
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
              Manage the terms for your project.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <CreateTermDialog project={project} canCreateTerms={canCreateTerms} />
        </div>
      </div>

      <div>
        <TermsTable
          terms={project.terms}
          canLockTerms={canLockTerms}
          canUpdateTerms={canUpdateTerms}
          canDeleteTerms={canDeleteTerms}
        />
      </div>
    </div>
  )
}
