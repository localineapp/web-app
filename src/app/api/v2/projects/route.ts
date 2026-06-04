import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { getMany } from "@/services/projects"
import z from "zod"

const QuerySchema = z.object({
  includeAll: z.coerce.boolean().default(false),
})

/**
 * GET /api/v2/projects - List user's projects
 */
export const GET = validateRequest({}, async (request, _, { user }) => {
  const searchParams = new URL(request.url).searchParams

  try {
    const { includeAll } = QuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    )

    const projects = await getMany({ user, includeAll })
    return Response.json(toJsonSafe(projects), {
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
