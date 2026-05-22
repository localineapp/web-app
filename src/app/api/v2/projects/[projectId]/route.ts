import { createHeaders, withApiKey } from "@/lib/api"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toJsonSafe } from "@/lib/utils"
import { fullProjectArgs } from "@/types/project"

/**
 * GET /api/v2/projects/[projectId] - Get project details
 */
export const GET = withApiKey<{ projectId: string }>(
  async (_, { params }, { apiKey, user }) => {
    const { projectId } = await params

    const hasPermission = (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            projects: ["read"],
          },
        },
      })
    ).success

    const project = hasPermission
      ? await prisma.project.findUnique({
          ...fullProjectArgs,
          where: {
            id: projectId,
          },
        })
      : await prisma.project.findFirst({
          ...fullProjectArgs,
          where: {
            id: projectId,
            members: {
              some: {
                userId: user?.id,
              },
            },
          },
        })

    if (!project) {
      return Response.json(
        { error: "Project not found" },
        {
          status: 404,
          headers: createHeaders(apiKey, {
            version: "v2",
          }),
        }
      )
    }

    return Response.json(toJsonSafe(project), {
      status: 200,
      headers: createHeaders(apiKey, {
        version: "v2",
      }),
    })
  }
)
