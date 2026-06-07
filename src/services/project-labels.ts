import { getIcon, normalizeHexColor } from "@/lib/project-utils"
import { FullProject } from "@/types/project"
import { ProjectLabel } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"

export async function createLabel({
  project,
  name,
  description,
  color,
  icon,
}: {
  project: FullProject
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
}): Promise<ProjectLabel> {
  const normalizedName = name?.trim()
  if (name && !normalizedName) {
    throw new Error("A label name is required.")
  }

  if (normalizedName && normalizedName.length > 255) {
    throw new Error("A label name must be 255 characters or less.")
  }

  const normalizedDescription = description?.trim() || null
  if (
    description &&
    normalizedDescription &&
    normalizedDescription.length > 500
  ) {
    throw new Error("A label description must be 500 characters or less.")
  }

  if (project.labels.some((label) => label.name === normalizedName)) {
    throw new Error(`A label named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  if (color && !normalizedColor) {
    throw new Error(
      `The color "${color}" is not a valid hex color code. It must be in the format #RRGGBB.`
    )
  }

  const normalizedIcon = icon?.trim() || null
  if (icon && !normalizedIcon) {
    throw new Error("The icon name cannot be empty.")
  }

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error(`The icon "${normalizedIcon}" is not a valid icon name.`)
  }

  if (
    project.plan.labelsLimit !== null &&
    project.labels.length >= project.plan.labelsLimit
  ) {
    throw new Error(
      "This project has reached the maximum number of labels allowed by the current plan."
    )
  }

  return await prisma.projectLabel.create({
    data: {
      id: generateId(),
      projectId: project.id,
      name: normalizedName,
      description: normalizedDescription,
      color: normalizedColor,
      icon: normalizedIcon,
    },
  })
}

export async function updateLabel({
  project,
  labelId,
  name,
  description,
  color,
  icon,
}: {
  project: FullProject
  labelId: string
  name?: string
  description?: string | null
  color?: string | null
  icon?: string | null
}) {
  if (
    name === undefined &&
    description === undefined &&
    color === undefined &&
    icon === undefined
  ) {
    throw new Error(
      "At least one of the update fields (name, description, color, or icon) must be provided."
    )
  }

  const label = project.labels.find((label) => label.id === labelId)
  if (!label) {
    throw new Error(`No label with the ID "${labelId}" found in this project.`)
  }

  const normalizedName = name?.trim()
  if (name && !normalizedName) {
    throw new Error("A label name is required.")
  }

  if (normalizedName && normalizedName.length > 255) {
    throw new Error("A label name must be 255 characters or less.")
  }

  const normalizedDescription = description?.trim() || null
  if (
    description &&
    normalizedDescription &&
    normalizedDescription.length > 500
  ) {
    throw new Error("A label description must be 500 characters or less.")
  }

  if (
    normalizedName &&
    normalizedName !== label.name &&
    project.labels.some((otherLabel) => otherLabel.name === normalizedName)
  ) {
    throw new Error(`A label named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  if (color && !normalizedColor) {
    throw new Error(
      `The color "${color}" is not a valid hex color code. It must be in the format #RRGGBB.`
    )
  }

  const normalizedIcon = icon?.trim() || null
  if (icon && !normalizedIcon) {
    throw new Error("The icon name cannot be empty.")
  }

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error(`The icon "${normalizedIcon}" is not a valid icon name.`)
  }

  return await prisma.projectLabel.update({
    where: {
      id: label.id,
    },
    data: {
      name: normalizedName,
      description: normalizedDescription,
      color: normalizedColor,
      icon: normalizedIcon,
    },
  })
}

export async function deleteLabel({
  project,
  labelId,
}: {
  project: FullProject
  labelId: string
}): Promise<ProjectLabel> {
  const label = project.labels.find((label) => label.id === labelId)
  if (!label) {
    throw new Error(`No label with the ID "${labelId}" found in this project.`)
  }

  return await prisma.projectLabel.delete({
    where: {
      projectId: project.id,
      id: label.id,
    },
  })
}
