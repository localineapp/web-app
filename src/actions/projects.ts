"use server"

import { auth } from "@/lib/auth"
import { Plan, Project, ProjectLabel, ProjectMemberRole } from "@prisma/client"
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
import { getIcon } from "@/lib/project-utils"

function normalizeHexColor(color?: string | null): string | null {
  if (!color || !color.trim()) return null

  const normalizedColor = color.trim().toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
    throw new Error("Color must be a valid hex code in the format #RRGGBB.")
  }

  return normalizedColor
}

async function canManageProjectFeature({
  projectId,
  permission,
}: {
  projectId: string
  permission: bigint
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
            projects: ["update"],
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

  if (name.length > 32) {
    throw new Error("Project name must be at most 32 characters.")
  }

  if (description && description.length > 255) {
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
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  if (name && name.length > 32) {
    throw new Error("Project name must be at most 32 characters.")
  }

  if (description && description.length > 255) {
    throw new Error("Project description must be at most 255 characters.")
  }

  const user = session.user
  const project = await findProject(projectId, user)

  if (!project) {
    return notFound()
  }

  const member = project.members.find((m) => m.userId === user.id)

  const canUpdateProject =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_PROJECT
    ) ||
    (
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

  if (!canUpdateProject) {
    return forbidden()
  }

  return await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name,
      description: description || null,
    },
  })
}

export async function createProjectLabel({
  projectId,
  name,
  description,
  color,
  icon,
}: {
  projectId: string
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
}): Promise<ProjectLabel> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LABELS,
  })

  const normalizedName = name.trim()
  if (!normalizedName) {
    throw new Error("Label name is required.")
  }

  if (
    await prisma.projectLabel.count({
      where: {
        projectId: project.id,
        name: normalizedName,
      },
    })
  ) {
    throw new Error(`A label named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectLabel.create({
    data: {
      id: generateId(),
      projectId: project.id,
      name: normalizedName,
      description: description?.trim() || null,
      color: normalizedColor,
      icon: normalizedIcon,
    },
  })
}

export async function updateProjectLabel({
  projectId,
  labelId,
  name,
  description,
  color,
  icon,
}: {
  projectId: string
  labelId: string
  name?: string
  description?: string | null
  color?: string | null
  icon?: string | null
}): Promise<ProjectLabel> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LABELS,
  })

  const label = project.labels.find(
    (currentLabel) => currentLabel.id === labelId
  )
  if (!label) {
    return notFound()
  }

  const normalizedName = name?.trim()
  if (name !== undefined && !normalizedName) {
    throw new Error("Label name is required.")
  }

  if (
    normalizedName &&
    normalizedName !== label.name &&
    (await prisma.projectLabel.count({
      where: {
        projectId: project.id,
        name: normalizedName,
      },
    })) > 0
  ) {
    throw new Error(`A label named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectLabel.update({
    where: {
      id: label.id,
    },
    data: {
      name: normalizedName,
      description:
        description !== undefined ? description?.trim() || null : undefined,
      color: color !== undefined ? normalizedColor : undefined,
      icon: icon !== undefined ? normalizedIcon : undefined,
    },
  })
}

export async function deleteProjectLabel({
  projectId,
  labelId,
}: {
  projectId: string
  labelId: string
}): Promise<ProjectLabel> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_LABELS,
  })

  const label = project.labels.find(
    (currentLabel) => currentLabel.id === labelId
  )
  if (!label) {
    return notFound()
  }

  return await prisma.projectLabel.delete({
    where: {
      id: label.id,
    },
  })
}

export async function createProjectMemberRole({
  projectId,
  name,
  color,
  icon,
}: {
  projectId: string
  name: string
  color?: string | null
  icon?: string | null
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const normalizedName = name.trim()
  if (!normalizedName) {
    throw new Error("Role name is required.")
  }

  if (
    await prisma.projectMemberRole.count({
      where: {
        projectId: project.id,
        name: normalizedName,
      },
    })
  ) {
    throw new Error(`A role named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectMemberRole.create({
    data: {
      id: generateId(),
      projectId: project.id,
      name: normalizedName,
      color: normalizedColor,
      icon: normalizedIcon,
      permissions: 0n,
    },
  })
}

export async function updateProjectMemberRole({
  projectId,
  roleId,
  name,
  color,
  icon,
}: {
  projectId: string
  roleId: string
  name?: string
  color?: string | null
  icon?: string | null
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    return notFound()
  }

  const normalizedName = name?.trim()
  if (name !== undefined && !normalizedName) {
    throw new Error("Role name is required.")
  }

  if (
    normalizedName &&
    normalizedName !== role.name &&
    (await prisma.projectMemberRole.count({
      where: {
        projectId: project.id,
        name: normalizedName,
      },
    })) > 0
  ) {
    throw new Error(`A role named "${normalizedName}" already exists.`)
  }

  const normalizedColor = normalizeHexColor(color)
  const normalizedIcon = icon?.trim() ? icon.trim() : null

  if (normalizedIcon && !getIcon(normalizedIcon)) {
    throw new Error("Selected icon is invalid.")
  }

  return await prisma.projectMemberRole.update({
    where: {
      id: role.id,
    },
    data: {
      name: normalizedName,
      color: color !== undefined ? normalizedColor : undefined,
      icon: icon !== undefined ? normalizedIcon : undefined,
    },
  })
}

export async function updateProjectMemberRolePermissions({
  projectId,
  roleId,
  permissions,
}: {
  projectId: string
  roleId: string
  permissions: bigint
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    return notFound()
  }

  if (role.id === project.id) {
    throw new Error("Owner role permissions cannot be edited.")
  }

  return await prisma.projectMemberRole.update({
    where: {
      id: role.id,
    },
    data: {
      permissions,
    },
  })
}

export async function deleteProjectMemberRole({
  projectId,
  roleId,
}: {
  projectId: string
  roleId: string
}): Promise<ProjectMemberRole> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.MANAGE_ROLES,
  })

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    return notFound()
  }

  if (role.id === project.id) {
    throw new Error("Owner role cannot be deleted.")
  }

  const inUseByMembers = await prisma.projectMember.count({
    where: {
      projectId: project.id,
      roleId: role.id,
    },
  })

  if (inUseByMembers > 0) {
    throw new Error(
      "This role is still assigned to one or more project members and cannot be deleted."
    )
  }

  const inUseByInvitations = await prisma.projectInvitation.count({
    where: {
      projectId: project.id,
      roleId: role.id,
    },
  })

  if (inUseByInvitations > 0) {
    throw new Error(
      "This role is still assigned to one or more pending invitations and cannot be deleted."
    )
  }

  return await prisma.projectMemberRole.delete({
    where: {
      id: role.id,
    },
  })
}

export async function updatePlan(
  project: Project,
  plan: Plan
): Promise<Project> {
  const canUpdatePlan = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        projects: ["update-plan"],
      },
    },
  })

  if (!canUpdatePlan) {
    return forbidden()
  }

  return await prisma.project.update({
    where: { id: project.id },
    data: {
      planId: plan.id,
    },
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
