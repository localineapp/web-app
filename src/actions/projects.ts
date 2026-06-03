"use server"

import { auth } from "@/lib/auth"
import { Project } from "@prisma/client"
import { headers } from "next/headers"
import { forbidden, notFound, unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import {
  AllProjectPermissions,
  combinePermissions,
  hasPermission,
  ProjectPermission,
} from "@/lib/project-permissions"
import { FullProject, fullProjectArgs } from "@/types/project"
import { findProject } from "@/lib/project"
import { getMany, getOne, update } from "@/services/projects"

export async function canManageProjectFeature({
  projectId,
  permission,
  adminPermission = {
    projects: ["update"],
  },
}: {
  projectId: string
  permission: bigint
  adminPermission?: Parameters<
    typeof auth.api.userHasPermission
  >[0] extends undefined
    ? never
    : NonNullable<
        Parameters<typeof auth.api.userHasPermission>[0]
      >["body"]["permissions"]
}): Promise<FullProject> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user
  const project = await findProject(projectId, user)

  if (!project) {
    return notFound()
  }

  const member = project.members.find((m) => m.userId === user.id)
  const canManage =
    hasPermission(member?.role.permissions ?? 0n, permission) ||
    (
      await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: {
            ...adminPermission,
          },
        },
      })
    ).success

  if (!canManage) {
    return forbidden()
  }

  return project
}

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

  return await getMany({ user, includeAll })
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

  return await getOne({ user, projectId })
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

  const normalizedName = name.trim()
  if (!normalizedName) {
    throw new Error("Project name is required.")
  }

  if (normalizedName.length > 32) {
    throw new Error("Project name must be at most 32 characters.")
  }

  if (description && description.trim().length > 255) {
    throw new Error("Project description must be at most 255 characters.")
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
        name: normalizedName,
        description: description?.trim() || null,
        planId,
      },
    })

    await tx.projectMemberRole.createMany({
      data: [
        {
          id: projectId,
          projectId,
          name: "Owner",
          color: "#FF5555",
          icon: "Star",
          permissions: AllProjectPermissions,
        },
        {
          id: generateId(),
          projectId,
          name: "Admin",
          color: "#FF5555",
          icon: "Shield",
          permissions: AllProjectPermissions,
        },
        {
          id: generateId(),
          projectId,
          name: "Editor",
          color: "#8CB3FF",
          icon: "Pencil",
          permissions: combinePermissions(
            ProjectPermission.TRANSLATE,
            ProjectPermission.ASSIGN_LABELS
          ),
        },
        {
          id: generateId(),
          projectId,
          name: "Read-Only",
          color: "#AAAAAA",
          icon: "Eye",
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

export async function updateProject({
  projectId,
  name,
  description,
}: {
  projectId: string
  name?: string
  description?: string
}): Promise<Project | null> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_PROJECT,
  })

  return await update({
    project,
    name,
    description,
  })
}

export async function updateProjectPlan({
  projectId,
  planId,
}: {
  projectId: string
  planId: string
}): Promise<Project> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const user = session.user
  const canUpdatePlan = await auth.api.userHasPermission({
    body: {
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update-plan"],
      },
    },
  })

  if (!canUpdatePlan.success) {
    return forbidden()
  }

  const project = await prisma.project.findUnique({
    ...fullProjectArgs,
    where: {
      id: projectId,
    },
  })

  if (!project) {
    return notFound()
  }

  return await update({
    project,
    planId,
  })
}

export async function deleteProject(project: Project): Promise<Project | null> {
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

  const canDeleteProject =
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

  if (!canDeleteProject) {
    return forbidden()
  }

  return await prisma.project.delete({
    where: {
      id: project.id,
    },
  })
}
