import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import { removeLocale } from "@/services/project-locales"

/**
 * GET /api/v2/projects/[projectId]/locales - Get a specific project locale's details
 */
export const GET = validateRequest<{ projectId: string; localeId: string }>(
  {},
  async (_, { localeId }, { project }) => {
    const locale = project?.locales.find(
      (projectLocale) => projectLocale.id === localeId
    )

    if (!locale) {
      return Response.json(
        {
          error: {
            code: "PROJECT_LOCALE_NOT_FOUND",
            message: `No locale with the ID "${localeId}" found in this project.`,
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

    return Response.json(toJsonSafe(locale), {
      headers: createHeaders({
        options: {
          version: "v2",
        },
      }),
    })
  }
)

/**
 * DELETE /api/v2/projects/[projectId]/locales/[localeId] - Delete a specific locale from the project
 */
export const DELETE = validateRequest<{ projectId: string; localeId: string }>(
  {
    permission: ProjectPermission.MANAGE_LOCALES,
  },
  async (_, { localeId }, { project }) => {
    const locale = project?.locales.find((loc) => loc.localeId === localeId)

    if (!locale) {
      return Response.json(
        {
          error: {
            code: "PROJECT_LOCALE_NOT_FOUND",
            message: `No locale with the ID "${localeId}" found in this project.`,
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
      const removedLocale = await removeLocale({
        project: project!,
        projectLocaleId: locale.id,
      })

      return Response.json(toJsonSafe(removedLocale), {
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
