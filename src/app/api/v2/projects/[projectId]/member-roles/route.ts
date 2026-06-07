import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { createMemberRole } from "@/services/project-member-roles"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/member-roles - Get project member roles
 */
export const GET = validateRequest<{ projectId: string }>(
  {},
  async (_, __, { project }) => {
    return Response.json(toJsonSafe(project?.memberRoles), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * POST /api/v2/projects/[projectId]/member-roles - Create a new member role for the project
 */
export const POST = validateRequest<{ projectId: string }>(
  {
    permission: ProjectPermission.MANAGE_ROLES,
  },
  async (request, _, { project }) => {
    const body = await request.json()

    try {
      const { name, color, icon } = z
        .object({
          name: z.string().max(255),
          color: z.string().max(7).optional(),
          icon: z.string().max(255).optional(),
        })
        .parse(body)

      const newRole = createMemberRole({
        project: project!,
        name,
        color,
        icon,
      })

      return Response.json(toJsonSafe(newRole), {
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
