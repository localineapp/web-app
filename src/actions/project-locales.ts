"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { ProjectLocale } from "@prisma/client"
import { addLocale, removeLocale } from "@/services/project-locales"
import { LocalesService } from "@/services/locales"
import { auth } from "@/lib/auth"

export async function addProjectLocale({
  projectId,
  localeId,
}: {
  projectId: string
  localeId: string
}): Promise<ProjectLocale> {
  const { user, project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LOCALES,
  })

  const locale = await LocalesService.getLocale(localeId)

  if (!locale) {
    throw new Error(`Locale with ID "${localeId}" does not exist.`)
  }

  if (!locale.enabled) {
    const hasPermission = (await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: user.role ?? "user",
        permissions: {
          locales: ["read:disabled"],
        },
      },
    })).success

    if (!hasPermission) {
      throw new Error(`Locale with ID "${localeId}" does not exist.`)
    }
  }

  return await addLocale({
    project,
    localeId,
  })
}

export async function removeProjectLocale({
  projectId,
  projectLocaleId,
}: {
  projectId: string
  projectLocaleId: string
}): Promise<ProjectLocale> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LOCALES,
  })

  return await removeLocale({
    project,
    projectLocaleId,
  })
}
