import { ProjectTranslation } from "@prisma/client"
import { generateId } from "better-auth"
import { prisma } from "@/lib/prisma"
import { ProjectTranslationWithTerm } from "@/types/project"

export async function upsertTranslation({
  termId,
  localeId,
  value,
}: {
  termId: string
  localeId: string
  value: string | null
}): Promise<ProjectTranslationWithTerm> {
  const normalizedValue = value?.trim() || null
  if (value && normalizedValue && normalizedValue.length > 2000) {
    throw new Error("A translation value must be 2000 characters or less.")
  }

  if (value == null) {
    return await prisma.projectTranslation.delete({
      where: {
        termId_localeId: {
          termId,
          localeId,
        },
      },
      include: {
        term: true,
      },
    })
  } else {
    return await prisma.projectTranslation.upsert({
      where: {
        termId_localeId: {
          termId,
          localeId,
        },
      },
      create: {
        id: generateId(),
        termId,
        localeId,
        value,
      },
      update: {
        value,
      },
      include: {
        term: true,
      },
    })
  }
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
