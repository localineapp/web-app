import { createHeaders, withApiKey } from "@/lib/api"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { fullProjectArgs } from "@/types/project"

/**
 * GET /api/v1/projects/[projectId] - Get project details
 * @deprecated Use v2 instead
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
            version: "v1",
            deprecated: true,
          }),
        }
      )
    }

    return Response.json(
      {
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          ownerId:
            project.members.find((m) => m.roleId === project.id)?.userId ||
            null,
          owner: {
            name:
              project.members.find((m) => m.roleId === project.id)?.user.name ||
              null,
            email: "redacted",
          },
        },
      },
      {
        status: 200,
        headers: createHeaders(apiKey, {
          version: "v1",
          deprecated: true,
        }),
      }
    )
  }
)

/**
 * PATCH /api/v1/projects/[projectId] - Update project details
 * @deprecated Use v2 instead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
}

/**
 * DELETE /api/v1/projects/[projectId] - Delete a project
 * @deprecated Project deletion can't be done through the API anymore.
 */
export async function DELETE() {
  return new Response(
    "Project deletion can't be done through the API anymore.",
    {
      status: 400,
    }
  )
}
