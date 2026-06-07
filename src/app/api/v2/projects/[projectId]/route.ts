import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { update } from "@/services/projects"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId] - Get project details
 */
export const GET = validateRequest<{ projectId: string }>(
  {},
  async (_, __, { project }) => {
    return Response.json(toJsonSafe(project), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * PATCH /api/v2/projects/[projectId] - Update project details
 */
export const PATCH = validateRequest<{ projectId: string }>(
  {
    permission: ProjectPermission.MANAGE_PROJECT,
  },
  async (request, _, { project }) => {
    const body = await request.json()

    try {
      const { name, description } = z
        .object({
          name: z.string().max(255).optional(),
          description: z.string().max(255).optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
          message: "At least one field must be provided for update",
        })
        .parse(body)

      const updatedProject = await update({
        project: project!,
        name,
        description,
      })

      return Response.json(toJsonSafe(updatedProject), {
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
