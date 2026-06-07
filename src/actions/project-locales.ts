"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { ProjectLocale } from "@prisma/client"
import { addLocale, removeLocale } from "@/services/project-locales"

export async function addProjectLocale({
  projectId,
  localeId,
}: {
  projectId: string
  localeId: string
}): Promise<ProjectLocale> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LOCALES,
  })

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
