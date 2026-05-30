"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { ProjectLocale } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { notFound } from "next/navigation"

export async function addProjectLocale({
  projectId,
  localeId,
}: {
  projectId: string
  localeId: string
}): Promise<ProjectLocale> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LOCALES,
  })

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

export async function removeProjectLocale({
  projectId,
  localeId,
}: {
  projectId: string
  localeId: string
}): Promise<ProjectLocale> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LOCALES,
  })

  const projectLocale = project.locales.find((locale) => locale.id === localeId)

  if (!projectLocale) {
    return notFound()
  }

  return await prisma.projectLocale.delete({
    where: {
      id: projectLocale.id,
    },
  })
}
