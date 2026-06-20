"use server"

import { ProjectLocale, ProjectMember } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { notFound, unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FullProjectMember, projectMemberArgs } from "@/types/project"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { updateMember } from "@/services/project-members"

export async function getProjectMembers({
  projectId,
}: {
  projectId: string
}): Promise<FullProjectMember[]> {
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

  const member = canReadAllProjects
    ? null
    : await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: user.id,
        },
        include: {
          role: {
            select: {
              permissions: true,
            },
          },
        },
      })

  const canViewEmail =
    canReadAllProjects ||
    (member?.role.permissions != null &&
      (hasPermission(
        member.role.permissions,
        ProjectPermission.INVITE_MEMBERS
      ) ||
        hasPermission(
          member.role.permissions,
          ProjectPermission.UPDATE_MEMBERS
        ) ||
        hasPermission(
          member.role.permissions,
          ProjectPermission.REMOVE_MEMBERS
        )))

  const members = await prisma.projectMember.findMany({
    ...projectMemberArgs,
    where: canReadAllProjects
      ? {
          projectId,
        }
      : {
          projectId,
          project: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
  })

  return members.map((member) => ({
    ...member,
    user: {
      ...member.user,
      email: canViewEmail ? member.user.email : "",
    },
  }))
}

export async function updateProjectMember({
  projectId,
  memberId,
  roleId,
  locales,
}: {
  projectId: string
  memberId: string
  roleId?: string
  locales?: ProjectLocale[]
}): Promise<ProjectMember> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.UPDATE_MEMBERS,
  })

  return await updateMember({
    project,
    memberId,
    roleId,
    locales,
  })
}

export async function updateProjectMemberRole({
  projectId,
  memberId,
  roleId,
}: {
  projectId: string
  memberId: string
  roleId: string
}): Promise<ProjectMember> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.UPDATE_MEMBERS,
  })

  const member = project.members.find((m) => m.id === memberId)
  if (!member) {
    return notFound()
  }

  const role = project.memberRoles.find((r) => r.id === roleId)
  if (!role) {
    return notFound()
  }

  if (role.id === project.id) {
    throw new Error("Cannot assign the owner role to members.")
  }

  if (member.roleId === project.id) {
    throw new Error("Owner role cannot be changed.")
  }

  return await prisma.projectMember.update({
    where: {
      id: member.id,
    },
    data: {
      roleId: role.id,
    },
  })
}

export async function updateProjectMemberLocales({
  projectId,
  memberId,
  locales,
}: {
  projectId: string
  memberId: string
  locales?: ProjectLocale[]
}): Promise<ProjectMember> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.UPDATE_MEMBERS,
  })

  const member = project.members.find((m) => m.id === memberId)
  if (!member) {
    return notFound()
  }

  if (member.roleId === project.id) {
    throw new Error("Owner's locales cannot be changed.")
  }

  return await prisma.projectMember.update({
    where: {
      id: member.id,
    },
    data: {
      locales: {
        set: locales,
      },
    },
  })
}

export async function removeProjectMember({
  projectId,
  memberId,
}: {
  projectId: string
  memberId: string
}): Promise<FullProjectMember> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.REMOVE_MEMBERS,
  })

  const member = project.members.find((m) => m.id === memberId)
  if (!member) {
    return notFound()
  }

  if (member.roleId === project.id) {
    throw new Error("Owner cannot be removed from the project.")
  }

  return await prisma.projectMember.delete({
    ...projectMemberArgs,
    where: {
      id: member.id,
    },
  })
}
