import { createHeaders, withApiKey } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { toJsonSafe } from "@/lib/utils"
import { fullProjectArgs } from "@/types/project"

/**
 * GET /api/v2/projects - List user's projects
 */
export const GET = withApiKey(async (_, __, { apiKey, user }) => {
  const projects = await prisma?.project.findMany({
    where: {
      members: {
        some: {
          userId: user?.id,
        },
      },
    },
    ...fullProjectArgs,
  })

  return Response.json(toJsonSafe(projects || []), {
    status: 200,
    headers: createHeaders(apiKey, {
      version: "v2",
    }),
  })
})
