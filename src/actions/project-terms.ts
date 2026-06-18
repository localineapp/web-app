"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { ProjectLabel, ProjectTerm } from "@prisma/client"
import { createTerm, deleteTerm, updateTerm } from "@/services/project-terms"

export async function createProjectTerm({
  projectId,
  key,
  context,
  locked,
}: {
  projectId: string
  key: string
  context?: string | null
  locked?: boolean
}): Promise<ProjectTerm> {
  const { project, member } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.CREATE_TERMS,
  })

  if (locked && member && hasPermission(member.role.permissions, ProjectPermission.LOCK_TERMS)) {
    throw new Error("You don't have permission to create locked terms.")
  }

  return createTerm({
    project,
    key,
    context,
    locked,
  })
}

export async function updateProjectTerm({
  projectId,
  termId,
  key,
  context,
  locked,
  labels,
}: {
  projectId: string
  termId: string
  key?: string
  context?: string | null
  locked?: boolean
  labels?: ProjectLabel[]
}): Promise<ProjectTerm> {
  const { project, member } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.UPDATE_TERMS,
  })

  if (locked !== undefined && member && hasPermission(member.role.permissions, ProjectPermission.LOCK_TERMS)) {
    throw new Error("You don't have permission to lock or unlock terms.")
  }

  if (labels !== undefined && member && !hasPermission(member.role.permissions, ProjectPermission.ASSIGN_LABELS)) {
    throw new Error("You don't have permission to assign labels to terms.")
  }

  return await updateTerm({
    project,
    termId,
    key,
    context,
    locked,
    labels,
  })
}

export async function deleteProjectTerm({
  projectId,
  termId,
}: {
  projectId: string
  termId: string
}): Promise<void> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.DELETE_TERMS,
  })

  return await deleteTerm({
    project,
    termId,
  })
}
