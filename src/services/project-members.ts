import { FullProject } from "@/types/project"
import { ProjectLocale, ProjectMember } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function updateMember({
  project,
  memberId,
  roleId,
  locales,
}: {
  project: FullProject
  memberId: string
  roleId?: string
  locales?: ProjectLocale[]
}): Promise<ProjectMember> {
  if (roleId === undefined && locales === undefined) {
    throw new Error(
      "At least one of the update fields (roleId or locales) must be provided."
    )
  }

  const member = project.members.find((m) => m.id === memberId)
  if (!member) {
    throw new Error(
      `No member with the ID "${memberId}" found in this project.`
    )
  }

  if (roleId !== undefined) {
    const role = project.memberRoles.find((r) => r.id === roleId)
    if (!role) {
      throw new Error(`No role with the ID "${roleId}" found in this project.`)
    }

    if (role.id === project.id) {
      throw new Error("The owner role can't be assigned to members.")
    }

    if (member.roleId === project.id) {
      throw new Error("The role of the owner can't be changed.")
    }
  }

  return await prisma.projectMember.update({
    where: {
      projectId: project.id,
      id: member.id,
    },
    data: {
      roleId,
      locales: locales ? { set: locales } : undefined,
    },
  })
}
