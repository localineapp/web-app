import { createHeaders, validateRequest } from "@/lib/api"
import { NextRequest } from "next/server"

/**
 * GET /api/v1/projects/[projectId] - Get project details
 * @deprecated Use v2 instead
 */
export const GET = validateRequest({}, async (_, __, { user, project }) => {
  const owner = project?.members.find((member) => member.roleId === project.id)

  return Response.json(
    {
      data: {
        id: project?.id,
        name: project?.name,
        description: project?.description,
        ownerId: owner?.userId || null,
        owner: {
          name: owner?.user?.name || null,
          email: user.id === owner?.userId ? user?.email || null : "[redacted]",
        },
        createdAt: project?.createdAt,
        updatedAt: project?.updatedAt,
      },
    },
    {
      status: 200,
      headers: createHeaders({
        options: {
          version: "v1",
        },
      }),
    }
  )
})

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
