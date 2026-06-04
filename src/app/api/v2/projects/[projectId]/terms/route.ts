import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { createTerm } from "@/services/project-terms"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/terms - Get project terms
 */
export const GET = validateRequest<{ projectId: string }>(
  {},
  async (_, __, { project }) => {
    return Response.json(toJsonSafe(project?.terms), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * POST /api/v2/projects/[projectId]/terms - Create a new term for the project
 */
export const POST = validateRequest<{ projectId: string }>(
  {
    permission: ProjectPermission.CREATE_TERMS,
  },
  async (request, _, { project }) => {
    const body = await request.json()

    try {
      const { key, context, locked } = z
        .object({
          key: z.string().max(255),
          context: z.string().max(255).optional(),
          locked: z.boolean().optional(),
        })
        .parse(body)

      const newTerm = await createTerm({
        project: project!,
        key,
        context,
        locked,
      })

      return Response.json(toJsonSafe(newTerm), {
        status: 201,
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
