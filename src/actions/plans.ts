"use server"

import { auth } from "@/lib/auth"
import { Plan } from "@prisma/client"
import { headers } from "next/headers"
import { forbidden, notFound, unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { create, getMany, update } from "@/services/plans"

export async function getPlans(): Promise<Plan[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return await getMany()
}

export async function getDefaultPlan(): Promise<Plan | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return await prisma.plan.findFirst({
    where: {
      default: true,
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
    return forbidden()
  }

  return await create({
    displayName,
    description,
    localesLimit,
    termsLimit,
    labelsLimit,
    membersLimit,
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
    return forbidden()
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
    return forbidden()
  }

  return await update(id, {
    displayName,
    description,
    localesLimit,
    termsLimit,
    labelsLimit,
    membersLimit,
  })
}

export async function updateDefaultPlan(planId: string): Promise<Plan> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        plans: ["update"],
      },
    },
  })

  if (!hasPermission) {
    return forbidden()
  }

  if ((await prisma.plan.count({ where: { id: planId } })) === 0) {
    return notFound()
  }

  return await prisma.$transaction(async (prisma) => {
    await prisma.plan.updateMany({
      where: { default: true },
      data: { default: false },
    })

    return await prisma.plan.update({
      where: { id: planId },
      data: { default: true },
    })
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
    return forbidden()
  }

  return await prisma.plan.delete({
    where: { id },
  })
}
