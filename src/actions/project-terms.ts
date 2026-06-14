"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
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
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.CREATE_TERMS,
  })

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
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.UPDATE_TERMS,
  })

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
