import { prisma } from "@/lib/prisma"
import { Plan } from "@prisma/client"
import { generateId } from "better-auth"

export async function getMany(): Promise<Plan[]> {
  return await prisma.plan.findMany({
    orderBy: {
      createdAt: "asc",
    },
  })
}

export async function getOne(planId: string): Promise<Plan | null> {
  return await prisma.plan.findUnique({
    where: {
      id: planId,
    },
  })
}

export async function create({
  displayName,
  description,
  localesLimit,
  termsLimit,
  labelsLimit,
  membersLimit,
}: {
  displayName: string
  description?: string | null
  localesLimit?: number | null
  termsLimit?: number | null
  labelsLimit?: number | null
  membersLimit?: number | null
}): Promise<Plan> {
  const normalizedName = displayName?.trim()
  if (displayName && !normalizedName) {
    throw new Error("A plan displayName is required.")
  }

  if (normalizedName && normalizedName.length > 255) {
    throw new Error("A plan displayName must be 255 characters or less.")
  }

  const normalizedDescription = description?.trim() || null
  if (
    description &&
    normalizedDescription &&
    normalizedDescription.length > 500
  ) {
    throw new Error("A plan description must be 500 characters or less.")
  }

  if (localesLimit !== undefined && localesLimit !== null && localesLimit < 0) {
    throw new Error("A plan localesLimit must be a non-negative number.")
  }

  if (termsLimit !== undefined && termsLimit !== null && termsLimit < 0) {
    throw new Error("A plan termsLimit must be a non-negative number.")
  }

  if (labelsLimit !== undefined && labelsLimit !== null && labelsLimit < 0) {
    throw new Error("A plan labelsLimit must be a non-negative number.")
  }

  if (membersLimit !== undefined && membersLimit !== null && membersLimit < 0) {
    throw new Error("A plan membersLimit must be a non-negative number.")
  }

  return await prisma.plan.create({
    data: {
      id: generateId(),
      displayName,
      description,
      localesLimit,
      termsLimit,
      labelsLimit,
      membersLimit,
    },
  })
}

export async function update(
  id: string,
  {
    displayName,
    description,
    localesLimit,
    termsLimit,
    labelsLimit,
    membersLimit,
  }: {
    displayName?: string
    description?: string | null
    localesLimit?: number | null
    termsLimit?: number | null
    labelsLimit?: number | null
    membersLimit?: number | null
  }
): Promise<Plan> {
  const normalizedName = displayName?.trim()
  if (displayName && !normalizedName) {
    throw new Error("A plan displayName is required.")
  }

  if (normalizedName && normalizedName.length > 255) {
    throw new Error("A plan displayName must be 255 characters or less.")
  }

  const normalizedDescription = description?.trim() || null
  if (
    description &&
    normalizedDescription &&
    normalizedDescription.length > 500
  ) {
    throw new Error("A plan description must be 500 characters or less.")
  }

  if (localesLimit !== undefined && localesLimit !== null && localesLimit < 0) {
    throw new Error("A plan localesLimit must be a non-negative number.")
  }

  if (termsLimit !== undefined && termsLimit !== null && termsLimit < 0) {
    throw new Error("A plan termsLimit must be a non-negative number.")
  }

  if (labelsLimit !== undefined && labelsLimit !== null && labelsLimit < 0) {
    throw new Error("A plan labelsLimit must be a non-negative number.")
  }

  if (membersLimit !== undefined && membersLimit !== null && membersLimit < 0) {
    throw new Error("A plan membersLimit must be a non-negative number.")
  }

  return await prisma.plan.update({
    where: { id },
    data: {
      displayName,
      description,
      localesLimit,
      termsLimit,
      labelsLimit,
      membersLimit,
    },
  })
}
