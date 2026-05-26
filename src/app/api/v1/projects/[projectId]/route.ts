import { createHeaders, withApiKey } from "@/lib/api"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import z from "zod"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { findProject } from "@/lib/project"

/**
 * GET /api/v1/projects/[projectId] - Get project details
 * @deprecated Use v2 instead
 */
export const GET = withApiKey<{ projectId: string }>(
  async (_, { params }, { apiKey, user }) => {
    const { projectId } = await params

    const project = await findProject(projectId, user)

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
export const PATCH = withApiKey<{ projectId: string }>(
  async (request, { params }, { apiKey, user }) => {
    const { projectId } = await params

    const body = await request.json()
    const validatedData = z
      .object({
        name: z.string().min(1).max(32).optional(),
        description: z.string().min(1).max(255).optional(),
      })
      .refine(
        (data) => data.name !== undefined || data.description !== undefined,
        {
          message: "At least one field must be provided",
        }
      )
      .parse(body)

    const project = await findProject(projectId, user)

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

    const member = project.members.find((m) => m.userId === user?.id)

    if (
      !hasPermission(
        member?.role.permissions ?? 0n,
        ProjectPermission.MANAGE_PROJECT
      )
    ) {
      const canUpdateProjects = (
        await auth.api.userHasPermission({
          body: {
            // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
            role: user.role ?? "user",
            permissions: {
              projects: ["update"],
            },
          },
        })
      ).success
      if (!canUpdateProjects) {
        return Response.json(
          { error: "You don't have permission to update this project" },
          {
            status: 403,
            headers: createHeaders(apiKey, {
              version: "v1",
              deprecated: true,
            }),
          }
        )
      }
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    })

    const owner = project.members.find((m) => m.roleId === project.id)

    return Response.json(
      {
        data: {
          id: updatedProject.id,
          name: updatedProject.name,
          description: updatedProject.description,
          ownerId: owner?.userId || null,
          createdAt: updatedProject.createdAt,
          updatedAt: updatedProject.updatedAt,
          memberRole:
            owner?.userId === user?.id ? null : member?.roleId || null,
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
