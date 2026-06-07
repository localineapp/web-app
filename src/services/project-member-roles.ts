import { getIcon, normalizeHexColor } from "@/lib/project-utils"
import { FullProject } from "@/types/project"
import { ProjectMemberRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"

export async function createMemberRole({
  project,
  name,
  color,
  icon,
  permissions,
}: {
  project: FullProject
  name: string
  color?: string | null
  icon?: string | null
  permissions?: bigint | null
}): Promise<ProjectMemberRole> {
  const normalizedName = name?.trim()
  if (name && !normalizedName) {
    throw new Error("A role name is required.")
  }

  if (project.memberRoles.some((role) => role.name === normalizedName)) {
    throw new Error(`A role named "${normalizedName}" already exists.`)
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

  if (project.memberRoles.length >= 100) {
    throw new Error("A project cannot have more than 100 member roles.")
  }

  return await prisma.projectMemberRole.create({
    data: {
      id: generateId(),
      projectId: project.id,
      name: normalizedName,
      color: normalizedColor,
      icon: normalizedIcon,
      permissions: permissions || 0n,
    },
  })
}

export async function updateMemberRole({
  project,
  roleId,
  name,
  color,
  icon,
  permissions,
}: {
  project: FullProject
  roleId: string
  name?: string
  color?: string | null
  icon?: string | null
  permissions?: bigint | null
}): Promise<ProjectMemberRole> {
  if (
    name === undefined &&
    color === undefined &&
    icon === undefined &&
    permissions === undefined
  ) {
    throw new Error(
      "At least one of the update fields (name, color, icon, or permissions) must be provided."
    )
  }

  const role = project.memberRoles.find((role) => role.id === roleId)
  if (!role) {
    throw new Error(`No role with the ID "${roleId}" found in this project.`)
  }

  const normalizedName = name?.trim()
  if (name && !normalizedName) {
    throw new Error("A role name is required.")
  }

  if (normalizedName && normalizedName.length > 255) {
    throw new Error("A role name must be 255 characters or less.")
  }

  if (
    normalizedName &&
    normalizedName !== role.name &&
    project.memberRoles.some((otherRole) => otherRole.name === normalizedName)
  ) {
    throw new Error(`A role named "${normalizedName}" already exists.`)
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

  if (permissions && role.id === project.id) {
    throw new Error("Owner role permissions cannot be edited.")
  }

  return await prisma.projectMemberRole.update({
    where: {
      id: role.id,
    },
    data: {
      name: normalizedName,
      color: normalizedColor,
      icon: normalizedIcon,
      permissions: permissions ? permissions : undefined,
    },
  })
}

export async function deleteMemberRole({
  project,
  roleId,
}: {
  project: FullProject
  roleId: string
}): Promise<ProjectMemberRole> {
  const role = project.memberRoles.find((role) => role.id === roleId)
  if (!role) {
    throw new Error(`No role with the ID "${roleId}" found in this project.`)
  }

  if (role.id === project.id) {
    throw new Error("The owner role cannot be deleted.")
  }

  if (project.members.some((member) => member.roleId === role.id)) {
    throw new Error(
      "Cannot delete a role that is currently assigned to members."
    )
  }

  return await prisma.projectMemberRole.delete({
    where: {
      projectId: project.id,
      id: role.id,
    },
  })
}
