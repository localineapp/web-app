import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { addLocale } from "@/services/project-locales"
import z from "zod"

/**
 * GET /api/v2/projects/[projectId]/locales - Get project locales
 */
export const GET = validateRequest<{ projectId: string }>(
  {},
  async (_, __, { project }) => {
    return Response.json(toJsonSafe(project?.locales), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * POST /api/v2/projects/[projectId]/locales - Add a new locale to the project
 */
export const POST = validateRequest<{ projectId: string }>(
  {
    permission: ProjectPermission.MANAGE_LOCALES,
  },
  async (request, _, { project }) => {
    const body = await request.json()

    try {
      const { localeId } = z
        .object({
          localeId: z.string().max(255),
        })
        .parse(body)

      const newLocale = await addLocale({
        project: project!,
        localeId,
      })

      return Response.json(toJsonSafe(newLocale), {
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
