"use server"

import { ProjectLabel } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import {
  createLabel,
  deleteLabel,
  updateLabel,
} from "@/services/project-labels"

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

  return await createLabel({
    project,
    name,
    description,
    color,
    icon,
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

  return await updateLabel({
    project,
    labelId,
    name,
    description,
    color,
    icon,
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

  return deleteLabel({
    project,
    labelId,
  })
}
