import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { PlansService } from "@/services/plans"
import z from "zod"

/**
 * GET /api/v2/plans/[planId] - Get a specific plan's details
 */
export const GET = validateRequest<{ planId: string }>(
  {
    adminPermission: {
      plans: ["read"],
    },
  },
  async (_, { planId }) => {
    const plan = await PlansService.getPlan(planId)

    if (!plan) {
      return Response.json(
        {
          error: {
            code: "PLAN_NOT_FOUND",
            message: `No plan with the ID "${planId}" found.`,
            status: 404,
          },
        },
        {
          status: 404,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    }

    return Response.json(toJsonSafe(plan), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * PATCH /api/v2/plans/[planId] - Update a specific plan's details
 */
export const PATCH = validateRequest<{ planId: string }>(
  {
    adminPermission: {
      plans: ["update"],
    },
  },
  async (request, { planId }) => {
    const body = await request.json()
    const {
      displayName,
      description,
      localesLimit,
      termsLimit,
      labelsLimit,
      membersLimit,
    } = z
      .object({
        displayName: z.string().max(255).optional(),
        description: z.string().max(255).optional(),
        localesLimit: z.number().int().positive().nullable().optional(),
        termsLimit: z.number().int().positive().nullable().optional(),
        labelsLimit: z.number().int().positive().nullable().optional(),
        membersLimit: z.number().int().positive().nullable().optional(),
      })
      .parse(body)

    try {
      const updatedPlan = await PlansService.updatePlan(planId, {
        displayName,
        description,
        localesLimit,
        termsLimit,
        labelsLimit,
        membersLimit,
      })

      if (!updatedPlan) {
        return Response.json(
          {
            error: {
              code: "PLAN_NOT_FOUND",
              message: `No plan with the ID "${planId}" found.`,
              status: 404,
            },
          },
          {
            status: 404,
            headers: createHeaders({
              options: {
                version: "v2",
              },
            }),
          }
        )
      }

      return Response.json(toJsonSafe(updatedPlan), {
        headers: createHeaders({
          options: {
            version: "v2",
          },
        }),
      })
    } catch (error) {
      return handleApiError(error, { version: "v2" })
    }
  }
)

/**
 * DELETE /api/v2/plans/[planId] - Delete a specific plan
 */
export const DELETE = validateRequest<{ planId: string }>(
  {
    adminPermission: {
      plans: ["delete"],
    },
  },
  async (_, { planId }) => {
    try {
      const deletedPlan = await PlansService.deletePlan(planId)

      if (!deletedPlan) {
        return Response.json(
          {
            error: {
              code: "PLAN_NOT_FOUND",
              message: `No plan with the ID "${planId}" found.`,
              status: 404,
            },
          },
          {
            status: 404,
            headers: createHeaders({
              options: {
                version: "v2",
              },
            }),
          }
        )
      }

      return Response.json(toJsonSafe(deletedPlan), {
        headers: createHeaders({
          options: {
            version: "v2",
          },
        }),
      })
    } catch (error) {
      return handleApiError(error, { version: "v2" })
    }
  }
)
