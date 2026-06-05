import { FullProject } from "@/types/project"
import { ProjectLocale, ProjectTerm, ProjectTranslation } from "@prisma/client"
import { generateId } from "better-auth"
import { prisma } from "@/lib/prisma"

export async function upsertTranslation({
  termId,
  localeId,
  value,
}: {
  termId: string
  localeId: string
  value: string
}): Promise<ProjectTranslation> {
  const normalizedValue = value.trim() || null
  if (normalizedValue && normalizedValue.length > 500) {
    throw new Error("A translation value must be 500 characters or less.")
  }

  return await prisma.projectTranslation.upsert({
    where: {
      termId_localeId: {
        termId: termId,
        localeId: localeId,
      },
    },
    create: {
      id: generateId(),
      termId: termId,
      localeId: localeId,
      value,
    },
    update: {
      value,
    },
  })
}

export async function getTranslation(
  translationId: string
): Promise<ProjectTranslation | null> {
  return await prisma.projectTranslation.findUnique({
    where: {
      id: translationId,
    },
  })
}

export async function deleteTranslation({
  translationId,
}: {
  translationId: string
}) {
  const translation = prisma.projectTranslation.delete({
    where: {
      id: translationId,
    },
  })

  if (!translation) {
    throw new Error(
      `No translation with the ID "${translationId}" found in this project.`
    )
  }

  return translation
}
