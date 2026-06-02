import { auth } from "@/lib/auth"
import { FullProject, fullProjectArgs } from "@/types/project"
import { User } from "better-auth"
import { prisma } from "@/lib/prisma"

export async function getMany({
  user,
  includeAll = false,
}: {
  user: User
  includeAll?: boolean
}): Promise<FullProject[]> {
  if (includeAll) {
    const canReadAllProjects = (
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

    if (!canReadAllProjects) {
      throw new Error("You are not allowed to read all projects.", {
        cause: {
          code: "FORBIDDEN",
          status: 403,
        },
      })
    }
  }

  return await prisma.project.findMany({
    ...fullProjectArgs,
    where: includeAll
      ? undefined
      : {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
    orderBy: {
      createdAt: "asc",
    },
  })
}

export async function getOne({
  user,
  projectId,
}: {
  user: User
  projectId: string
}): Promise<FullProject | null> {
  const canReadAllProjects = (
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

  return canReadAllProjects
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
}
