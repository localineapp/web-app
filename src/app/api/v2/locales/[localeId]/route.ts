import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { LocalesService } from "@/services/locales"
import z from "zod"

/**
 * GET /api/v2/locales/[localeId] - Get a specific locale's details
 */
export const GET = validateRequest<{ localeId: string }>(
  {},
  async (_, { localeId }) => {
    const locale = await LocalesService.getLocale(localeId)

    if (!locale) {
      return Response.json(
        {
          error: {
            code: "LOCALE_NOT_FOUND",
            message: `No locale with the ID "${localeId}" found.`,
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
 * PATCH /api/v2/locales/[localeId] - Update a specific locale's details
 */
export const PATCH = validateRequest<{ localeId: string }>(
  {
    adminPermission: {
      locales: ["update"],
    },
  },
  async (request, { localeId }) => {
    const body = await request.json()
    const { displayName, language, region, code, flag, enabled } = z
      .object({
        displayName: z.string().max(255).optional(),
        language: z.string().max(255).optional(),
        region: z.string().max(255).optional(),
        code: z.string().max(255).optional(),
        flag: z.string().max(255).optional(),
        enabled: z.boolean().optional(),
      })
      .parse(body)

    try {
      const updatedLocale = await LocalesService.updateLocale(localeId, {
        displayName,
        language,
        region,
        code,
        flag,
        enabled,
      })

      return Response.json(toJsonSafe(updatedLocale), {
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
 * DELETE /api/v2/locales/[localeId] - Delete a specific locale
 */
export const DELETE = validateRequest<{ localeId: string }>(
  {
    adminPermission: {
      locales: ["delete"],
    },
  },
  async (_, { localeId }) => {
    try {
      const deletedLocale = await LocalesService.deleteLocale(localeId)

      if (!deletedLocale) {
        return Response.json(
          {
            error: {
              code: "LOCALE_NOT_FOUND",
              message: `No locale with the ID "${localeId}" found.`,
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

      return Response.json(toJsonSafe(deletedLocale), {
        headers: createHeaders({
          options: {
            version: "v2",
          },
        }),
      })
    } catch (error) {
      return handleApiError(error, {
        version: "v2",
      })
    }
  }
)
