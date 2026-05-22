"use server"

import { auth } from "@/lib/auth"
import { Plan, Project } from "@prisma/client"
import { headers } from "next/headers"
import { forbidden, unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import {
  AllProjectPermissions,
  combinePermissions,
  ProjectPermission,
} from "@/lib/project-permissions"
import { FullProject, fullProjectArgs } from "@/types/project"

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
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            projects: ["read"],
          },
        },
      })
    ).success
    if (!hasPermission) {
      return forbidden()
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
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: user.role ?? "user",
        permissions: {
          projects: ["read"],
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
  planId,
}: {
  name: string
  description?: string
  planId: string
}): Promise<Project> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user
  const projectsLimit = user.projectsLimit

  const projectsCount = (
    await prisma.projectMember.findMany({
      where: {
        userId: user.id,
      },
      select: {
        projectId: true,
        roleId: true,
      },
    })
  ).filter((member) => member.projectId === member.roleId).length

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
        planId,
      },
    })

    await tx.projectMemberRole.createMany({
      data: [
        {
          id: projectId,
          projectId,
          name: "Owner",
          permissions: AllProjectPermissions,
        },
        {
          id: generateId(),
          projectId,
          name: "Admin",
          permissions: AllProjectPermissions,
        },
        {
          id: generateId(),
          projectId,
          name: "Editor",
          permissions: combinePermissions(
            ProjectPermission.TRANSLATE,
            ProjectPermission.ASSIGN_LABELS
          ),
        },
        {
          id: generateId(),
          projectId,
          name: "Read-Only",
          permissions: 0n,
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

export async function updatePlan(
  project: Project,
  plan: Plan
): Promise<Project> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        projects: ["update-plan"],
      },
    },
  })

  if (!hasPermission) {
    return forbidden()
  }

  return await prisma.project.update({
    where: { id: project.id },
    data: {
      planId: plan.id,
    },
  })
}

export async function deleteProject(project: Project): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId: project.id,
      userId: user.id,
    },
  })

  const hasPermission =
    member?.roleId == project.id ||
    (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            projects: ["delete"],
          },
        },
      })
    ).success

  if (!hasPermission) {
    return forbidden()
  }

  await prisma.project.delete({
    where: {
      id: project.id,
    },
  })
}
