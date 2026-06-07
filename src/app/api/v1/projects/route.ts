import { createHeaders, validateRequest } from "@/lib/api"
import { getMany } from "@/services/projects"

/**
 * GET /api/v1/projects - List user's projects
 * @deprecated Use v2 instead
 */
export const GET = validateRequest({}, async (_, __, { user }) => {
  const projects = await getMany({ user })

  return Response.json(
    {
      data: projects.map((project) => {
        const member = project.members.find(
          (member) => member.userId === user.id
        )
        const owner = project.members.find(
          (member) => member.roleId === project.id
        )
        const isOwner = owner?.userId === user.id

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          ownerId: owner?.userId || null,
          memberRole: isOwner ? null : member?.roleId || null,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        }
      }),
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
 * POST /api/v1/projects - Create a new project
 * @deprecated Project creation can't be done through the API anymore.
 */
export async function POST() {
  return new Response(
    "Project creation can't be done through the API anymore.",
    {
      status: 400,
    }
  )
}
