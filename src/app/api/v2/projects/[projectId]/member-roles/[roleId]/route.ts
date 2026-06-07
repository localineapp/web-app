import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import {
  deleteMemberRole,
  updateMemberRole,
} from "@/services/project-member-roles"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/member-roles/[roleId] - Get a specific member role's details
 */
export const GET = validateRequest<{ projectId: string; roleId: string }>(
  {},
  async (_, { roleId }, { project }) => {
    const role = project?.memberRoles.find((role) => role.id === roleId)

    if (!role) {
      return Response.json(
        {
          error: {
            code: "ROLE_NOT_FOUND",
            message: `No member role with the ID "${roleId}" found in this project.`,
            status: 404,
          },
        },
        {
          status: 404,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    }

    return Response.json(toJsonSafe(role), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * PATCH /api/v2/projects/[projectId]/member-roles/[roleId] - Update a specific member role's details
 */
export const PATCH = validateRequest<{ projectId: string; roleId: string }>(
  {
    permission: ProjectPermission.MANAGE_ROLES,
  },
  async (request, { roleId }, { project }) => {
    const body = await request.json()
    const role = project?.memberRoles.find((role) => role.id === roleId)

    if (!role) {
      return Response.json(
        {
          error: {
            code: "ROLE_NOT_FOUND",
            message: `No member role with the ID "${roleId}" found in this project.`,
            status: 404,
          },
        },
        {
          status: 404,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    }

    try {
      const { name, color, icon, permissions } = z
        .object({
          name: z.string().max(255).optional(),
          color: z.string().max(7).optional(),
          icon: z.string().max(255).optional(),
          permissions: z.bigint().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
          message: "At least one field must be provided for update",
        })
        .parse(body)

      const updatedRole = await updateMemberRole({
        project: project!,
        roleId,
        name,
        color,
        icon,
        permissions,
      })

      return Response.json(toJsonSafe(updatedRole), {
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

/**
 * DELETE /api/v2/projects/[projectId]/member-roles/[roleId] - Delete a specific member role
 */
export const DELETE = validateRequest<{ projectId: string; roleId: string }>(
  {
    permission: ProjectPermission.MANAGE_ROLES,
  },
  async (_, { roleId }, { project }) => {
    const role = project?.memberRoles.find((role) => role.id === roleId)

    if (!role) {
      return Response.json(
        {
          error: {
            code: "ROLE_NOT_FOUND",
            message: `No member role with the ID "${roleId}" found in this project.`,
            status: 404,
          },
        },
        {
          status: 404,
          headers: createHeaders({
            options: {
              version: "v2",
            },
          }),
        }
      )
    }

    try {
      const deletedRole = await deleteMemberRole({
        project: project!,
        roleId,
      })

      return Response.json(toJsonSafe(deletedRole), {
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
