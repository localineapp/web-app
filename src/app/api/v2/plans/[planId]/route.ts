import { validateRequest } from "@/lib/api"
import z from "zod"

/**
 * GET /api/v2/plans/[planId] - Get a specific plan's details
 */
export const GET = validateRequest<{ planId: string }>(
  {},
  async (_, { planId }) => {
    return Response.json({
      msg: "Not implemented yet",
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

    return Response.json({
      msg: "Not implemented yet",
    })
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
    return Response.json({
      msg: "Not implemented yet",
    })
  }
)
