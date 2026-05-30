"use server"

import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { notFound } from "next/navigation"

export async function createProjectTerm({
  projectId,
  key,
  context,
}: {
  projectId: string
  key: string
  context?: string | null
}) {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.CREATE_TERMS,
  })

  const normalizedKey = key.trim()
  if (!normalizedKey) {
    throw new Error("Term key is required.")
  }

  if (normalizedKey.length > 255) {
    throw new Error("Term key must be 255 characters or less.")
  }

  if (normalizedKey.includes(" ")) {
    throw new Error("Term key cannot contain spaces.")
  }

  if (context && context.length > 255) {
    throw new Error("Term context must be 255 characters or less.")
  }

  if (project.terms.some((term) => term.key === normalizedKey)) {
    throw new Error(`A term with the key "${normalizedKey}" already exists.`)
  }

  if (
    project.plan.termsLimit !== null &&
    project.terms.length >= project.plan.termsLimit
  ) {
    throw new Error(
      "This project has reached the maximum number of terms allowed by the current plan."
    )
  }

  return await prisma.projectTerm.create({
    data: {
      id: generateId(),
      projectId: project.id,
      key: normalizedKey,
      context: context?.trim() || null,
    },
  })
}

export async function updateProjectTerm({
  projectId,
  termId,
  key,
  context,
}: {
  projectId: string
  termId: string
  key?: string
  context?: string | null
}) {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.UPDATE_TERMS,
  })

  const term = project.terms.find((t) => t.id === termId)
  if (!term) {
    return notFound()
  }

  const normalizedKey = key?.trim()
  if (key !== undefined && !normalizedKey) {
    throw new Error("Term key is required.")
  }

  if (normalizedKey && normalizedKey.length > 255) {
    throw new Error("Term key must be 255 characters or less.")
  }

  if (normalizedKey && normalizedKey.includes(" ")) {
    throw new Error("Term key cannot contain spaces.")
  }

  if (context && context.length > 255) {
    throw new Error("Term context must be 255 characters or less.")
  }

  if (
    normalizedKey &&
    normalizedKey !== term.key &&
    project.terms.some((t) => t.key === normalizedKey)
  ) {
    throw new Error(`A term with the key "${normalizedKey}" already exists.`)
  }

  return await prisma.projectTerm.update({
    where: {
      id: term.id,
    },
    data: {
      key: normalizedKey,
      context: context?.trim() || null,
    },
  })
}

export async function assignLabelsToTerm({
  projectId,
  termId,
  labelIds,
}: {
  projectId: string
  termId: string
  labelIds: string[]
}) {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.ASSIGN_LABELS,
  })

  const term = project.terms.find((t) => t.id === termId)
  if (!term) {
    return notFound()
  }

  const validLabelIds = project.labels.map((label) => label.id)
  const labelsToAssign = labelIds.filter((id) => validLabelIds.includes(id))

  await prisma.projectTerm.update({
    where: {
      id: term.id,
    },
    data: {
      labels: {
        set: labelsToAssign.map((id) => ({ id })),
      },
    },
  })
}

export async function lockProjectTerm({
  projectId,
  termId,
  locked,
}: {
  projectId: string
  termId: string
  locked: boolean
}) {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.LOCK_TERMS,
  })

  const term = project.terms.find((t) => t.id === termId)
  if (!term) {
    return notFound()
  }

  return await prisma.projectTerm.update({
    where: {
      id: term.id,
    },
    data: {
      locked,
    },
  })
}

export async function deleteProjectTerm({
  projectId,
  termId,
}: {
  projectId: string
  termId: string
}) {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.DELETE_TERMS,
  })

  const term = project.terms.find((t) => t.id === termId)
  if (!term) {
    return notFound()
  }

  return await prisma.projectTerm.delete({
    where: {
      id: term.id,
    },
  })
}
