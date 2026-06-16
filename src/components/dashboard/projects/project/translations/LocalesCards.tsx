"use client"

import { useProject } from "@/components/project-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { getFlag } from "@/lib/project-utils"
import { AlertTriangleIcon, GlobeIcon, GlobeOffIcon } from "lucide-react"
import Link from "next/link"

export default function LocalesCards() {
  const { project, member } = useProject()

  if (project.locales.length === 0) {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GlobeOffIcon />
            </EmptyMedia>

            <EmptyTitle className="text-4xl">No Locales</EmptyTitle>

            <EmptyDescription className="text-lg">
              In order to add translations, you need at least one locale being
              added to your project.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild size="lg">
              <Link href={`/projects/${project.id}/locales`}>
                <GlobeIcon className="mr-2 h-5 w-5" />
                Go to Locales
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const sortedProjectLocales = [...project.locales].sort((a, b) => {
    const canTranslateA =
      !member ||
      (hasPermission(member.role.permissions, ProjectPermission.TRANSLATE) &&
        (member.locales.length === 0 ||
          member.locales.some((ml) => ml.localeId === a.locale.id)))

    const canTranslateB =
      !member ||
      (hasPermission(member.role.permissions, ProjectPermission.TRANSLATE) &&
        (member.locales.length === 0 ||
          member.locales.some((ml) => ml.localeId === b.locale.id)))

    if (canTranslateA !== canTranslateB) {
      return canTranslateA ? -1 : 1
    }

    return a.locale.displayName.localeCompare(b.locale.displayName)
  })

  return (
    <div className="grid min-h-full grid-cols-1 gap-4 md:grid-cols-2">
      {sortedProjectLocales.map((projectLocale) => {
        const FlagIcon = getFlag(projectLocale.locale.flag)

        const canTranslate =
          !member ||
          (hasPermission(
            member.role.permissions,
            ProjectPermission.TRANSLATE
          ) &&
            (member.locales.length === 0 ||
              member.locales.some(
                (ml) => ml.localeId === projectLocale.locale.id
              )))

        return (
          <Card key={projectLocale.id} className="w-full border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                <div className="flex items-center gap-2">
                  {FlagIcon && <FlagIcon className="h-5 w-5 rounded-sm" />}
                  {projectLocale.locale.displayName}
                </div>
              </CardTitle>

              <CardAction>
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/projects/${projectLocale.projectId}/translations/${projectLocale.locale.code}`}
                  >
                    Open Translations
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>

            {!canTranslate && (
              <CardContent>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  <AlertTriangleIcon className="mr-1 inline h-4 w-4" />
                  You don&rsquo;t have permission to translate for this locale.
                </p>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
