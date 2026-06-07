import { FullProject } from "@/types/project"
import { ProjectLocale } from "@prisma/client"
import { generateId } from "better-auth"
import { prisma } from "@/lib/prisma"

export async function addLocale({
  project,
  localeId,
}: {
  project: FullProject
  localeId: string
}): Promise<ProjectLocale> {
  if (project.locales.some((locale) => locale.localeId === localeId)) {
    throw new Error("This locale is already added to the project.")
  }

  if (
    project.plan.localesLimit !== null &&
    project.locales.length >= project.plan.localesLimit
  ) {
    throw new Error(
      "This project has reached the maximum number of locales allowed by the current plan."
    )
  }

  return await prisma.projectLocale.create({
    data: {
      id: generateId(),
      projectId: project.id,
      localeId,
    },
  })
}

export async function removeLocale({
  project,
  projectLocaleId,
}: {
  project: FullProject
  projectLocaleId: string
}): Promise<ProjectLocale> {
  if (
    !project.locales.some(
      (projectLocale) => projectLocale.id === projectLocaleId
    )
  ) {
    throw new Error(
      `No project locale with ID "${projectLocaleId}" found in this project.`
    )
  }

  return await prisma.projectLocale.delete({
    where: {
      projectId: project.id,
      id: projectLocaleId,
    },
  })
}
