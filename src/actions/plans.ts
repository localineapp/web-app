"use server"

import { auth } from "@/lib/auth"
import { Plan } from "@prisma/client"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { chunkArray } from "@/lib/utils"

export async function getPlans(): Promise<Plan[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return await prisma.plan.findMany({
    orderBy: {
      createdAt: "asc",
    },
  })
}

export async function createPlan({
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
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        plans: ["create"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
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

export async function createPlans(
  plans: {
    displayName: string
    description?: string | null
    localesLimit?: number | null
    termsLimit?: number | null
    labelsLimit?: number | null
    membersLimit?: number | null
  }[]
): Promise<ReturnType<typeof prisma.plan.createMany>> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        plans: ["create"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
  }

  return await prisma.plan.createMany({
    data: plans.map((plan) => ({
      id: generateId(),
      displayName: plan.displayName,
      description: plan.description,
      localesLimit: plan.localesLimit,
      termsLimit: plan.termsLimit,
      labelsLimit: plan.labelsLimit,
      membersLimit: plan.membersLimit,
    })),
  })
}

export async function updatePlan(
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
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        plans: ["update"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
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

export async function deletePlan(id: string): Promise<Plan> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        plans: ["delete"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
  }

  return await prisma.plan.delete({
    where: { id },
  })
}
