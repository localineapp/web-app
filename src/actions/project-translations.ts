"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { upsertTranslation } from "@/services/project-translations"

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
}) {
  const { member } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.TRANSLATE,
  })

  if (
    member &&
    member.locales.length > 0 &&
    !member.locales.some((l) => l.localeId === localeId)
  ) {
    throw new Error("You don't have access to translate this locale.")
  }

  return upsertTranslation({
    termId,
    localeId,
    value,
  })
}
