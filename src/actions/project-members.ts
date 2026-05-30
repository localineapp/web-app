"use server"

import { ProjectMember } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function updateProjectMember({
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

export async function removeProjectMember({
  projectId,
  memberId,
}: {
  projectId: string
  memberId: string
}): Promise<ProjectMember> {
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
    where: {
      id: member.id,
    },
  })
}
