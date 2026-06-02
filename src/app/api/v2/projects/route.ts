import { createHeaders, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { getMany } from "@/services/projects"
import z from "zod"

const QuerySchema = z.object({
  includeAll: z.coerce.boolean().default(false),
})

/**
 * GET /api/v2/projects - List user's projects
 */
export const GET = validateRequest(async (request, _, { user }) => {
  const searchParams = new URL(request.url).searchParams
  const { includeAll } = QuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  )

  try {
    const projects = await getMany({ user, includeAll })
    return Response.json(toJsonSafe(projects), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  } catch (error) {
    if (error instanceof Error) {
      const code =
        error.cause && typeof error.cause === "object" && "code" in error.cause
          ? error.cause.code
          : "INTERNAL_SERVER_ERROR"
      const status =
        error.cause &&
        typeof error.cause === "object" &&
        "status" in error.cause
          ? error.cause.status
          : 500
      const message = error.message || "An unknown error occurred."

      return Response.json(
        {
          error: {
            code,
            message,
            status,
          },
        },
        {
          // @ts-expect-error - status can be any number, but the ResponseInit type expects a specific set of numbers.
          status,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    } else {
      return Response.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unknown error occurred.",
            status: 500,
          },
        },
        {
          status: 500,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    }
  }
})
