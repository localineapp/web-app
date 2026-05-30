"use server"

import { ProjectLabel } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { prisma } from "@/lib/prisma"
import { getIcon, normalizeHexColor } from "@/lib/project-utils"
import { generateId } from "better-auth"
import { notFound } from "next/navigation"

export async function createProjectLabel({
  projectId,
  name,
  description,
  color,
  icon,
}: {
  projectId: string
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
}): Promise<ProjectLabel> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LABELS,
  })

  const normalizedName = name.trim()
  if (!normalizedName) {
    throw new Error("Label name is required.")
  }

  if (normalizedName.length > 255) {
    throw new Error("Label name must be 255 characters or less.")
  }

  if (description && description.trim().length > 500) {
    throw new Error("Label description must be 500 characters or less.")
  }

  if (project.labels.some((label) => label.name === normalizedName)) {
    throw new Error(`A label named "${normalizedName}" already exists.`)
  }

  if (
    project.plan.labelsLimit !== null &&
    project.labels.length + 1 >= project.plan.labelsLimit
  ) {
    throw new Error(
      "This project has reached the maximum number of labels allowed by the current plan."
    )
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectLabel.create({
    data: {
      id: generateId(),
      projectId: project.id,
      name: normalizedName,
      description: description?.trim() || null,
      color: normalizedColor,
      icon: normalizedIcon,
    },
  })
}

export async function updateProjectLabel({
  projectId,
  labelId,
  name,
  description,
  color,
  icon,
}: {
  projectId: string
  labelId: string
  name?: string
  description?: string | null
  color?: string | null
  icon?: string | null
}): Promise<ProjectLabel> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LABELS,
  })

  const label = project.labels.find(
    (currentLabel) => currentLabel.id === labelId
  )
  if (!label) {
    return notFound()
  }

  const normalizedName = name?.trim()
  if (name !== undefined && !normalizedName) {
    throw new Error("Label name is required.")
  }

  if (normalizedName && normalizedName.length > 255) {
    throw new Error("Label name must be 255 characters or less.")
  }

  if (description && description?.trim().length > 500) {
    throw new Error("Label description must be 500 characters or less.")
  }

  if (
    normalizedName &&
    normalizedName !== label.name &&
    (await prisma.projectLabel.count({
      where: {
        projectId: project.id,
        name: normalizedName,
      },
    })) > 0
  ) {
    throw new Error(`A label named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectLabel.update({
    where: {
      id: label.id,
    },
    data: {
      name: normalizedName,
      description:
        description !== undefined ? description?.trim() || null : undefined,
      color: color !== undefined ? normalizedColor : undefined,
      icon: icon !== undefined ? normalizedIcon : undefined,
    },
  })
}

export async function deleteProjectLabel({
  projectId,
  labelId,
}: {
  projectId: string
  labelId: string
}): Promise<ProjectLabel> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LABELS,
  })

  const label = project.labels.find(
    (currentLabel) => currentLabel.id === labelId
  )
  if (!label) {
    return notFound()
  }

  return await prisma.projectLabel.delete({
    where: {
      id: label.id,
    },
  })
}
