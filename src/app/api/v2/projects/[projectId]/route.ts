import { createHeaders, withApiKey } from "@/lib/api"
import { auth } from "@/lib/auth"
import { findProject } from "@/lib/project"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { toJsonSafe } from "@/lib/utils"
import z from "zod"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v2/projects/[projectId] - Get project details
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

/**
 * PATCH /api/v2/projects/[projectId] - Update project details
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

    return Response.json(toJsonSafe(updatedProject), {
      status: 200,
      headers: createHeaders(apiKey, {
        version: "v2",
      }),
    })
  }
)
