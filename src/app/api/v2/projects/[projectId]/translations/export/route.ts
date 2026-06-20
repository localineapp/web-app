import { createHeaders, handleApiError, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import z from "zod"

const QuerySchema = z.object({
  inverted: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val !== "false")
    .default(false),
})

/**
 * GET /api/v2/projects/[projectId]/translations/export - Export all translations of a project in a specific format
 */
export const GET = validateRequest<{ projectId: string }>(
  {},
  async (request, _, { project }) => {
    const searchParams = new URL(request.url).searchParams

    try {
      const { inverted } = QuerySchema.parse(
        Object.fromEntries(searchParams.entries())
      )

      const terms = project?.terms || []
      const locales = project?.locales || []

      const localeCodes = locales.map(({ id, locale }) => ({
        id,
        code: locale.code ?? id ?? locale.id,
      }))

      const termMaps = terms.map((term) => {
        const map = new Map<string, string>()

        for (const { localeId, value } of term.translations) {
          map.set(localeId, value)
        }

        return {
          key: term.key,
          map,
        }
      })

      const translations: Record<string, Record<string, string>> = {}

      if (inverted) {
        for (const locale of localeCodes) {
          translations[locale.code] = {}
        }

        for (const term of termMaps) {
          for (const locale of localeCodes) {
            translations[locale.code][term.key] = term.map.get(locale.id) ?? ""
          }
        }
      } else {
        for (const term of termMaps) {
          translations[term.key] = {}

          for (const locale of localeCodes) {
            translations[term.key][locale.code] = term.map.get(locale.id) ?? ""
          }
        }
      }

      return Response.json(toJsonSafe(translations), {
        status: 200,
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
