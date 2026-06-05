import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import {
  upsertTranslation,
  deleteTranslation,
  getTranslation,
} from "@/services/project-translations"

export async function upsertProjectTranslation({
  projectId,
  termId,
  localeId,
  value,
}: {
  projectId: string
  termId: string
  localeId: string
  value: string
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

export async function deleteProjectTranslation({
  projectId,
  translationId,
}: {
  projectId: string
  translationId: string
}) {
  const { member } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.TRANSLATE,
  })

  const translation = await getTranslation(translationId)

  if (!translation) {
    throw new Error(
      `No translation with the ID "${translationId}" found in this project.`
    )
  }

  if (
    member &&
    member.locales.length > 0 &&
    !member.locales.some((l) => l.localeId === translation?.localeId)
  ) {
    throw new Error("YOu don't have access to translate this locale.")
  }

  return await deleteTranslation({
    translationId,
  })
}
