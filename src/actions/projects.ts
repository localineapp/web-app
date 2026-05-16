"use server"

import { auth } from "@/lib/auth"
import { Prisma, Project } from "@prisma/client"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"

const fullProjectArgs = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    terms: {
      include: {
        translations: {
          include: {
            locale: {
              include: {
                locale: true,
              },
            },
          },
        },
        labels: true,
      },
    },
    labels: true,
    members: {
      include: {
        user: {
          omit: {
            banned: true,
            banReason: true,
            banExpires: true,
            email: true,
            emailVerified: true,
            lastLoginMethod: true,
            projectsLimit: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        role: true,
        locales: {
          include: {
            locale: true,
          },
        },
      },
    },
    memberRoles: true,
    locales: {
      include: {
        locale: true,
      },
    },
  },
})

export type FullProject = Prisma.ProjectGetPayload<{
  include: typeof fullProjectArgs.include
}>

export async function getProjects({
  includeAll,
}: {
  includeAll?: boolean
}): Promise<FullProject[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user

  if (includeAll) {
    const hasPermission = (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - session?.user.role can be undefined, but the API expects a string.
          role: session?.user.role ?? "user",
          permissions: {
            projects: ["read:all"],
          },
        },
      })
    ).success
    if (!hasPermission) {
      return unauthorized()
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

export async function getProject(
  projectId: string
): Promise<FullProject | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user
  const hasPermission = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - session?.user.role can be undefined, but the API expects a string.
        role: user.role ?? "user",
        permissions: {
          projects: ["read:all"],
        },
      },
    })
  ).success

  if (hasPermission) {
    return await prisma.project.findUnique({
      ...fullProjectArgs,
      where: {
        id: projectId,
      },
    })
  } else {
    return await prisma.project.findFirst({
      ...fullProjectArgs,
      where: {
        id: projectId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    })
  }
}

export async function createProject({
  name,
  description,
}: {
  name: string
  description?: string
}): Promise<Project> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user
  const projectsLimit = user.projectsLimit
  const projectsCount = await prisma.project.count({
    where: {
      members: {
        some: {
          userId: user.id,
          role: {
            name: "Owner",
          },
        },
      },
    },
  })

  if (projectsLimit !== null && projectsCount >= projectsLimit) {
    throw new Error(
      "You have reached the maximum number of projects you can create."
    )
  }

  const projectId = generateId()

  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        id: projectId,
        name,
        description,
      },
    })

    await tx.projectMemberRole.createMany({
      data: [
        {
          id: projectId,
          projectId,
          name: "Owner",
          permissions: 0,
        },
        {
          id: generateId(),
          projectId,
          name: "Admin",
          permissions: 0,
        },
        {
          id: generateId(),
          projectId,
          name: "Editor",
          permissions: 0,
        },
        {
          id: generateId(),
          projectId,
          name: "Read-Only",
          permissions: 0,
        },
      ],
    })

    await tx.projectMember.create({
      data: {
        id: generateId(),
        projectId,
        userId: user.id,
        roleId: projectId,
      },
    })

    return project
  })
}
