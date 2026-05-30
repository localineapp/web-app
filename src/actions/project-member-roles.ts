"use server"

import { ProjectMemberRole } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { prisma } from "@/lib/prisma"
import { getIcon, normalizeHexColor } from "@/lib/project-utils"
import { generateId } from "better-auth"
import { notFound } from "next/navigation"

export async function createProjectMemberRole({
  projectId,
  name,
  color,
  icon,
}: {
  projectId: string
  name: string
  color?: string | null
  icon?: string | null
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const normalizedName = name.trim()
  if (!normalizedName) {
    throw new Error("Role name is required.")
  }

  if (
    project.memberRoles.some((memberRole) => memberRole.name === normalizedName)
  ) {
    throw new Error(`A role named "${normalizedName}" already exists.`)
  }

  if (project.memberRoles.length + 1 >= 100) {
    throw new Error(
      "This project has reached the maximum number of roles a project can have."
    )
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectMemberRole.create({
    data: {
      id: generateId(),
      projectId: project.id,
      name: normalizedName,
      color: normalizedColor,
      icon: normalizedIcon,
      permissions: 0n,
    },
  })
}

export async function updateProjectMemberRole({
  projectId,
  roleId,
  name,
  color,
  icon,
}: {
  projectId: string
  roleId: string
  name?: string
  color?: string | null
  icon?: string | null
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    return notFound()
  }

  const normalizedName = name?.trim()
  if (name !== undefined && !normalizedName) {
    throw new Error("Role name is required.")
  }

  if (
    normalizedName &&
    normalizedName !== role.name &&
    project.memberRoles.some((memberRole) => memberRole.name === normalizedName)
  ) {
    throw new Error(`A role named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectMemberRole.update({
    where: {
      id: role.id,
    },
    data: {
      name: normalizedName,
      color: color !== undefined ? normalizedColor : undefined,
      icon: icon !== undefined ? normalizedIcon : undefined,
    },
  })
}

export async function updateProjectMemberRolePermissions({
  projectId,
  roleId,
  permissions,
}: {
  projectId: string
  roleId: string
  permissions: bigint
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    return notFound()
  }

  if (role.id === project.id) {
    throw new Error("Owner role permissions cannot be edited.")
  }

  return await prisma.projectMemberRole.update({
    where: {
      id: role.id,
    },
    data: {
      permissions,
    },
  })
}

export async function deleteProjectMemberRole({
  projectId,
  roleId,
}: {
  projectId: string
  roleId: string
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    return notFound()
  }

  if (role.id === project.id) {
    throw new Error("Owner role cannot be deleted.")
  }

  if (project.members.some((member) => member.roleId === role.id)) {
    throw new Error(
      "This role is still assigned to one or more project members and cannot be deleted."
    )
  }

  if (project.invitations.some((invitation) => invitation.roleId === role.id)) {
    throw new Error(
      "This role is still assigned to one or more pending invitations and cannot be deleted."
    )
  }

  return await prisma.projectMemberRole.delete({
    where: {
      id: role.id,
    },
  })
}
