import { FullProject } from "@/types/project"
import { ProjectLabel, ProjectTerm } from "@prisma/client"
import { generateId } from "better-auth"
import { prisma } from "@/lib/prisma"

export async function createTerm({
  project,
  key,
  context,
  locked,
  labels,
}: {
  project: FullProject
  key: string
  context?: string | null
  locked?: boolean
  labels?: ProjectLabel[]
}): Promise<ProjectTerm> {
  const normalizedKey = key?.trim()
  if (key && !normalizedKey) {
    throw new Error("A term key is required.")
  }

  if (normalizedKey && normalizedKey.length > 255) {
    throw new Error("A term key must be 255 characters or less.")
  }

  const normalizedContext = context?.trim() || null
  if (context && normalizedContext && normalizedContext.length > 500) {
    throw new Error("A term context must be 500 characters or less.")
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
      context: normalizedContext,
      locked,
      labels: labels
        ? { connect: labels.map((label) => ({ id: label.id })) }
        : undefined,
    },
  })
}

export async function updateTerm({
  project,
  termId,
  key,
  context,
  locked,
  labels,
}: {
  project: FullProject
  termId: string
  key?: string
  context?: string | null
  locked?: boolean
  labels?: ProjectLabel[]
}): Promise<ProjectTerm> {
  if (
    key === undefined &&
    context === undefined &&
    locked === undefined &&
    labels === undefined
  ) {
    throw new Error(
      "At least one of the update fields (key, context, locked or labels) must be provided."
    )
  }

  const term = project.terms.find((t) => t.id === termId)
  if (!term) {
    throw new Error(`No term with the ID "${termId}" found in this project.`)
  }

  const normalizedKey = key?.trim()
  if (key && !normalizedKey) {
    throw new Error("A term key is required.")
  }

  if (normalizedKey && normalizedKey.length > 255) {
    throw new Error("A term key must be 255 characters or less.")
  }

  const normalizedContext = context?.trim() || null
  if (context && normalizedContext && normalizedContext.length > 500) {
    throw new Error("A term context must be 500 characters or less.")
  }

  if (
    normalizedKey &&
    normalizedKey !== term.key &&
    project.terms.some((otherTerm) => otherTerm.key === normalizedKey)
  ) {
    throw new Error(`A term with the key "${normalizedKey}" already exists.`)
  }

  return await prisma.projectTerm.update({
    where: {
      id: term.id,
    },
    data: {
      key: normalizedKey,
      context: normalizedContext,
      locked,
      labels: labels ? { set: labels } : undefined,
    },
  })
}

export async function deleteTerm({
  project,
  termId,
}: {
  project: FullProject
  termId: string
}) {
  const term = project.terms.find((t) => t.id === termId)
  if (!term) {
    throw new Error(`No term with the ID "${termId}" found in this project.`)
  }

  await prisma.projectTerm.delete({
    where: {
      projectId: project.id,
      id: term.id,
    },
  })
}
