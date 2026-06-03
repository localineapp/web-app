import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { deleteLabel, updateLabel } from "@/services/project-labels"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/labels/[labelId] - Get a specific label's details
 */
export const GET = validateRequest<{ projectId: string; labelId: string }>(
  null,
  async (_, { labelId }, { project }) => {
    const label = project?.labels.find((label) => label.id === labelId)

    if (!label) {
      return Response.json(
        {
          error: {
            code: "LABEL_NOT_FOUND",
            message: `No label with the ID "${labelId}" found in this project.`,
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

    return Response.json(toJsonSafe(label), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * PATCH /api/v2/projects/[projectId]/labels/[labelId] - Update a specific label's details
 */
export const PATCH = validateRequest<{ projectId: string; labelId: string }>(
  ProjectPermission.MANAGE_LABELS,
  async (request, { labelId }, { project }) => {
    const body = await request.json()
    const { name, description, color, icon } = z
      .object({
        name: z.string().max(255).optional(),
        description: z.string().max(255).optional(),
        color: z.string().max(7).optional(),
        icon: z.string().max(255).optional(),
      })
      .parse(body)

    const label = project?.labels.find((label) => label.id === labelId)

    if (!label) {
      return Response.json(
        {
          error: {
            code: "LABEL_NOT_FOUND",
            message: `No label with the ID "${labelId}" found in this project.`,
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

    if (
      name === undefined &&
      description === undefined &&
      color === undefined &&
      icon === undefined
    ) {
      return Response.json(
        {
          error: {
            code: "NO_FIELDS_TO_UPDATE",
            message:
              "At least one of 'name', 'description', 'color', or 'icon' must be provided.",
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
      const updatedLabel = await updateLabel({
        project: project!,
        labelId,
        name,
        description,
        color,
        icon,
      })

      return Response.json(toJsonSafe(updatedLabel), {
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

export const DELETE = validateRequest<{ projectId: string; labelId: string }>(
  ProjectPermission.MANAGE_LABELS,
  async (_, { labelId }, { project }) => {
    const label = project?.labels.find((label) => label.id === labelId)

    if (!label) {
      return Response.json(
        {
          error: {
            code: "LABEL_NOT_FOUND",
            message: `No label with the ID "${labelId}" found in this project.`,
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
      const deletedLabel = await deleteLabel({
        project: project!,
        labelId,
      })

      return Response.json(toJsonSafe(deletedLabel), {
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
