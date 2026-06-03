import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { createLabel } from "@/services/project-labels"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/labels - Get project labels
 */
export const GET = validateRequest<{ projectId: string }>(
  null,
  async (_, __, { project }) => {
    return Response.json(toJsonSafe(project?.labels), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * POST /api/v2/projects/[projectId]/labels - Create a new label for the project
 */
export const POST = validateRequest<{ projectId: string }>(
  ProjectPermission.MANAGE_LABELS,
  async (request, _, { project }) => {
    const body = await request.json()
    const { name, description, color, icon } = z
      .object({
        name: z.string().max(255),
        description: z.string().max(255).optional(),
        color: z.string().max(7).optional(),
        icon: z.string().max(255).optional(),
      })
      .parse(body)

    try {
      const newLabel = await createLabel({
        project: project!,
        name,
        description,
        color,
        icon,
      })

      return Response.json(toJsonSafe(newLabel), {
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
