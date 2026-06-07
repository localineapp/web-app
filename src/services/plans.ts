import { prisma } from "@/lib/prisma"
import { Plan, Prisma } from "@prisma/client"
import { generateId } from "better-auth"

const validatePlanInput = ({
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
}) => {
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
}

export const PlansService = {
  async getPlans(
    orderBy: Prisma.PlanOrderByWithRelationInput = {
      createdAt: "asc",
    }
  ): Promise<Plan[]> {
    return prisma.plan.findMany({
      orderBy,
    })
  },

  async getPlan(planId: string): Promise<Plan | null> {
    return prisma.plan.findUnique({
      where: {
        id: planId,
      },
    })
  },

  async getDefaultPlan(): Promise<Plan | null> {
    return prisma.plan.findFirst({
      where: {
        default: true,
      },
    })
  },

  async createPlan({
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
    validatePlanInput({
      displayName,
      description,
      localesLimit,
      termsLimit,
      labelsLimit,
      membersLimit,
    })

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
  },

  async createPlans(
    plans: {
      displayName: string
      description?: string | null
      localesLimit?: number | null
      termsLimit?: number | null
      labelsLimit?: number | null
      membersLimit?: number | null
    }[]
  ): Promise<ReturnType<typeof prisma.plan.createMany>> {
    return await prisma.plan.createMany({
      data: plans.map((plan) => {
        validatePlanInput(plan)

        return {
          id: generateId(),
          displayName: plan.displayName,
          description: plan.description,
          localesLimit: plan.localesLimit,
          termsLimit: plan.termsLimit,
          labelsLimit: plan.labelsLimit,
          membersLimit: plan.membersLimit,
        }
      }),
    })
  },

  async updatePlan(
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
    validatePlanInput({
      displayName,
      description,
      localesLimit,
      termsLimit,
      labelsLimit,
      membersLimit,
    })

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
  },

  async updateDefaultPlan(id: string): Promise<Plan> {
    const currentDefaultPlan = await this.getDefaultPlan()

    if (currentDefaultPlan && currentDefaultPlan.id === id) {
      return currentDefaultPlan
    }

    return await prisma.$transaction(async (tx) => {
      if (currentDefaultPlan) {
        await tx.plan.update({
          where: { id: currentDefaultPlan.id },
          data: { default: false },
        })
      }

      return await tx.plan.update({
        where: { id },
        data: { default: true },
      })
    })
  },

  async deletePlan(id: string): Promise<Plan> {
    return await prisma.plan.delete({
      where: { id },
    })
  },
}
