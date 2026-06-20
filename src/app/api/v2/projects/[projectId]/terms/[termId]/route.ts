import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { deleteTerm, updateTerm } from "@/services/project-terms"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/terms/[termId] - Get a specific project term's details
 */
export const GET = validateRequest<{ projectId: string; termId: string }>(
  {},
  async (_, { termId }, { project }) => {
    const term = project?.terms.find((term) => term.id === termId)

    if (!term) {
      return Response.json(
        {
          error: {
            code: "TERM_NOT_FOUND",
            message: `No term with the ID "${termId}" found in this project.`,
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

    return Response.json(toJsonSafe(term), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * PATCH /api/v2/projects/[projectId]/terms/[termId] - Update a specific project term's details
 */
export const PATCH = validateRequest<{ projectId: string; termId: string }>(
  {
    permission: ProjectPermission.UPDATE_TERMS,
  },
  async (request, { termId }, { project, member }) => {
    const body = await request.json()
    const term = project?.terms.find((t) => t.id === termId)

    if (!term) {
      return Response.json(
        {
          error: {
            code: "TERM_NOT_FOUND",
            message: `No term with the ID "${termId}" found in this project.`,
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
      const { key, context, locked } = z
        .object({
          key: z.string().max(255).optional(),
          context: z.string().max(500).nullable().optional(),
          locked: z.boolean().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
          message: "At least one field must be provided for update",
        })
        .parse(body)

      if (
        locked !== undefined &&
        member &&
        !hasPermission(member.role.permissions, ProjectPermission.LOCK_TERMS)
      ) {
        throw new Error("You don't have permission to lock or unlock terms.")
      }

      const updatedTerm = await updateTerm({
        project: project!,
        termId,
        key,
        context,
        locked,
      })

      return Response.json(toJsonSafe(updatedTerm), {
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
 * DELETE /api/v2/projects/[projectId]/terms/[termId] - Delete a specific project term
 */
export const DELETE = validateRequest<{ projectId: string; termId: string }>(
  {
    permission: ProjectPermission.DELETE_TERMS,
  },
  async (_, { termId }, { project }) => {
    const term = project?.terms.find((t) => t.id === termId)

    if (!term) {
      return Response.json(
        {
          error: {
            code: "TERM_NOT_FOUND",
            message: `No term with the ID "${termId}" found in this project.`,
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
      const deletedTerm = await deleteTerm({
        project: project!,
        termId,
      })

      return Response.json(toJsonSafe(deletedTerm), {
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
