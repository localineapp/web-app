import { createHeaders, withApiKey } from "@/lib/api"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/projects - List user's projects
 * @deprecated Use v2 instead
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
    include: {
      members: true,
    },
  })

  return Response.json(
    {
      data:
        projects?.map((project) => {
          const owner = project.members.find((m) => m.roleId === project.id)
          const member = project.members.find((m) => m.userId === user?.id)

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            ownerId: owner?.userId || null,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            memberRole:
              owner?.userId === user?.id ? null : member?.roleId || null,
          }
        }) || [],
    },
    {
      status: 200,
      headers: createHeaders(apiKey, {
        version: "v1",
        deprecated: true,
      }),
    }
  )
})

/**
 * POST /api/v1/projects - Create a new project
 * @deprecated Project creation can't be done through the API anymore.
 */
export async function POST(request: NextRequest) {
  return new Response(
    "Project creation can't be done through the API anymore.",
    {
      status: 400,
    }
  )
}
