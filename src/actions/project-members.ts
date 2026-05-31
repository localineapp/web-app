"use server"

import { ProjectLocale, ProjectMember } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { notFound, unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  projectMemberArgs,
  ProjectMemberWithUserAndRole,
} from "@/types/project"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getProjectMembers({
  projectId,
}: {
  projectId: string
}): Promise<ProjectMemberWithUserAndRole[]> {
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
    ? await prisma.projectMember.findMany({
        ...projectMemberArgs,
        where: {
          projectId: projectId,
        },
      })
    : await prisma.projectMember.findMany({
        ...projectMemberArgs,
        where: {
          projectId: projectId,
          project: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
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
  const project = await canManageProjectFeature({
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
  const project = await canManageProjectFeature({
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
}): Promise<ProjectMemberWithUserAndRole> {
  const project = await canManageProjectFeature({
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
