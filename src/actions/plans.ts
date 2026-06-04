"use server"

import { auth } from "@/lib/auth"
import { Plan } from "@prisma/client"
import { headers } from "next/headers"
import { forbidden, unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { PlansService } from "@/services/plans"

export async function getPlans(): Promise<Plan[]> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        plans: ["read"],
      },
    },
  })

  if (!hasPermission) {
    return forbidden()
  }

  return await PlansService.getPlans()
}

export async function getDefaultPlan(): Promise<Plan | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return await PlansService.getDefaultPlan()
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

  return await PlansService.createPlan({
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

  return await PlansService.createPlans(
    plans.map((plan) => ({
      id: generateId(),
      displayName: plan.displayName,
      description: plan.description,
      localesLimit: plan.localesLimit,
      termsLimit: plan.termsLimit,
      labelsLimit: plan.labelsLimit,
      membersLimit: plan.membersLimit,
    }))
  )
}

export async function updatePlan(
  planId: string,
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

  return await PlansService.updatePlan(planId, {
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

  return await PlansService.updateDefaultPlan(planId)
}

export async function deletePlan(planId: string): Promise<Plan> {
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

  return await PlansService.deletePlan(planId)
}
