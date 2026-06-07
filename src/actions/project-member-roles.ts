"use server"

import { ProjectMemberRole } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import {
  createMemberRole,
  deleteMemberRole,
  updateMemberRole,
} from "@/services/project-member-roles"

export async function createProjectMemberRole({
  projectId,
  name,
  color,
  icon,
  permissions,
}: {
  projectId: string
  name: string
  color?: string | null
  icon?: string | null
  permissions?: bigint | null
}): Promise<ProjectMemberRole> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  return await createMemberRole({
    project,
    name,
    color,
    icon,
    permissions,
  })
}

export async function updateProjectMemberRole({
  projectId,
  roleId,
  name,
  color,
  icon,
  permissions,
}: {
  projectId: string
  roleId: string
  name?: string
  color?: string | null
  icon?: string | null
  permissions?: bigint | null
}): Promise<ProjectMemberRole> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  return await updateMemberRole({
    project,
    roleId,
    name,
    color,
    icon,
    permissions,
  })
}

export async function deleteProjectMemberRole({
  projectId,
  roleId,
}: {
  projectId: string
  roleId: string
}): Promise<ProjectMemberRole> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  return await deleteMemberRole({
    project,
    roleId,
  })
}
