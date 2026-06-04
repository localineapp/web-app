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
    const { name, description } = z
      .object({
        name: z.string().max(255).optional(),
        description: z.string().max(255).optional(),
      })
      .parse(body)

    if (!name && !description) {
      return Response.json(
        {
          error: {
            code: "NO_FIELDS_TO_UPDATE",
            message:
              "At least one of 'name' or 'description' must be provided.",
            status: 400,
          },
        },
        {
          status: 400,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    }

    try {
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
