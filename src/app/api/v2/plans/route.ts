import { createHeaders, validateRequest } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { toJsonSafe } from "@/lib/utils"
import z from "zod"

/**
 * GET /api/v2/plans - Get all plans
 */
export const GET = validateRequest({}, async (_, __) => {
  const plans = await prisma.plan.findMany({
    orderBy: {
      createdAt: "asc",
    },
  })

  return Response.json(toJsonSafe(plans), {
    headers: createHeaders({
      options: {
        version: "v2",
      },
    }),
  })
})

/**
 * POST /api/v2/plans - Create a new plan
 */
export const POST = validateRequest(
  {
    adminPermission: {
      plans: ["create"],
    },
  },
  async (request, __) => {
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
        displayName: z.string().max(255),
        description: z.string().max(255).optional(),
        localesLimit: z.number().int().positive().optional(),
        termsLimit: z.number().int().positive().optional(),
        labelsLimit: z.number().int().positive().optional(),
        membersLimit: z.number().int().positive().optional(),
      })
      .parse(body)

    return Response.json({
      msg: "Not implemented yet",
    })
  }
)
