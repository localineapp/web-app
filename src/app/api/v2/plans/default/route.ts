import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { PlansService } from "@/services/plans"
import z from "zod"

/**
 * GET /api/v2/plans/default - Get the default plan
 */
export const GET = validateRequest({}, async (_, __) => {
  try {
    const defaultPlan = await PlansService.getDefaultPlan()
    return Response.json(toJsonSafe(defaultPlan), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  } catch (error) {
    return handleApiError(error, { version: "v2" })
  }
})

/**
 * PATCH /api/v2/plans/default - Set the default plan
 */
export const PATCH = validateRequest(
  {
    adminPermission: {
      plans: ["update"],
    },
  },
  async (request, __) => {
    const body = await request.json()
    const { planId } = z
      .object({
        planId: z.string(),
      })
      .parse(body)

    try {
      const updatedPlan = await PlansService.updateDefaultPlan(planId)
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
