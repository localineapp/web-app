"use server"

import { ProjectInvitation } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { createHash } from "node:crypto"
import { notFound, unauthorized } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function createProjectInvitation({
  projectId,
  email,
  roleId,
}: {
  projectId: string
  email: string
  roleId: string
}): Promise<ProjectInvitation> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.INVITE_MEMBERS,
  })

  if (project.invitations.some((invitation) => invitation.email === email)) {
    throw new Error(
      "An invitation has already been sent to this email address."
    )
  }

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === roleId
  )
  if (!role) {
    throw new Error("Selected role does not exist.")
  }

  if (role.id === project.id) {
    throw new Error("Cannot assign the owner role to new members.")
  }

  if (
    await prisma.projectMember.count({
      where: { projectId: project.id, user: { email } },
    })
  ) {
    throw new Error("This user is already a member of the project.")
  }

  return await prisma.projectInvitation.create({
    data: {
      id: generateId(),
      projectId: project.id,
      email,
      token: createHash("sha256").update(generateId()).digest("hex"),
      roleId: role.id,
    },
  })
}

export async function getUsersProjectInvitations(): Promise<
  ProjectInvitation[]
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return unauthorized()
  }

  return await prisma.projectInvitation.findMany({
    where: {
      user: {
        id: session.user.id,
      },
    },
    include: {
      project: true,
    },
  })
}

export async function getProjectInvitationByToken(
  token: string
): Promise<ProjectInvitation | null> {
  const hashedToken = createHash("sha256").update(token).digest("hex")
  return await prisma.projectInvitation.findUnique({
    where: {
      token: hashedToken,
    },
    include: {
      project: true,
      role: true,
    },
  })
}

export async function updateProjectInvitation({
  projectId,
  invitationId,
  newRoleId,
}: {
  projectId: string
  invitationId: string
  newRoleId: string
}): Promise<ProjectInvitation> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.INVITE_MEMBERS,
  })

  const invitation = project.invitations.find((inv) => inv.id === invitationId)
  if (!invitation) {
    return notFound()
  }

  const role = project.memberRoles.find(
    (memberRole) => memberRole.id === newRoleId
  )
  if (!role) {
    throw new Error("Selected role does not exist.")
  }

  if (role.id === project.id) {
    throw new Error("Cannot assign the owner role to members.")
  }

  return await prisma.projectInvitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      roleId: role.id,
    },
  })
}

export async function acceptProjectInvitation({
  token,
}: {
  token: string
}): Promise<ProjectInvitation> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return unauthorized()
  }

  const hashedToken = createHash("sha256").update(token).digest("hex")
  const invitation = await prisma.projectInvitation.findUnique({
    where: {
      token: hashedToken,
    },
    include: {
      user: true,
    },
  })

  if (!invitation || invitation.user.id !== session.user.id) {
    return notFound()
  }

  await prisma.projectMember.create({
    data: {
      id: generateId(),
      projectId: invitation.projectId,
      userId: session.user.id,
      roleId: invitation.roleId,
    },
  })
  return await prisma.projectInvitation.delete({
    where: {
      id: invitation.id,
    },
  })
}

export async function revokeProjectInvitation({
  projectId,
  invitationId,
}: {
  projectId: string
  invitationId: string
}): Promise<ProjectInvitation> {
  const project = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.INVITE_MEMBERS,
  })

  const invitation = project.invitations.find((inv) => inv.id === invitationId)
  if (!invitation) {
    return notFound()
  }

  return await prisma.projectInvitation.delete({
    where: {
      id: invitation.id,
    },
  })
}
