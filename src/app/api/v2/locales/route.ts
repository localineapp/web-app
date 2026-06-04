import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { LocalesService } from "@/services/locales"
import z from "zod"

/**
 * GET /api/v2/locales - Get all currently available locales in the system
 */
export const GET = validateRequest({}, async (_, __) => {
  const locales = await LocalesService.getLocales()

  return Response.json(toJsonSafe(locales), {
    headers: createHeaders({
      options: {
        version: "v2",
      },
    }),
  })
})

/**
 * POST /api/v2/locales - Create a new locale
 */
export const POST = validateRequest(
  {
    adminPermission: {
      locales: ["create"],
    },
  },
  async (request, __) => {
    const body = await request.json()

    try {
      const { displayName, language, region, code, flag, enabled } = z
        .object({
          displayName: z.string().max(255),
          language: z.string().max(255),
          region: z.string().max(255).optional(),
          code: z.string().max(255),
          flag: z.string().max(255).optional(),
          enabled: z.boolean().optional(),
        })
        .parse(body)

      const newLocale = await LocalesService.createLocale({
        displayName,
        language,
        region,
        code,
        flag,
        enabled,
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
