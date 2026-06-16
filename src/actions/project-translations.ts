"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { upsertTranslation } from "@/services/project-translations"
import { ProjectTranslationWithTerm } from "@/types/project"

export async function upsertProjectTranslation({
  projectId,
  termId,
  localeId,
  value,
}: {
  projectId: string
  termId: string
  localeId: string
  value: string | null
}): Promise<ProjectTranslationWithTerm> {
  const { project, member } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.TRANSLATE,
  })

  if (
    member &&
    member.locales.length > 0 &&
    !member.locales.some(({ id }) => id === localeId)
  ) {
    throw new Error("You don't have access to translate this locale.")
  }

  const term = project.terms.find(({ id }) => id === termId)
  if (
    term?.locked &&
    member &&
    !hasPermission(member.role.permissions, ProjectPermission.TRANSLATE_LOCKED)
  ) {
    throw new Error("You don't have permission to translate locked terms.")
  }

  return upsertTranslation({
    termId,
    localeId,
    value,
  })
}
