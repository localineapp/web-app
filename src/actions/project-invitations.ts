"use server"

import { ProjectInvitation } from "@prisma/client"
import { canManageProjectFeature } from "@/actions/projects"
import { ProjectPermission } from "@/lib/project-permissions"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { notFound, unauthorized } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
  ProjectInvitationWithProject,
  ProjectInvitationWithProjectAndRole,
} from "@/types/project"
import { encrypt, isEncrypted } from "@/lib/crypto"

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
    (await prisma.user.count({
      where: { email, emailVerified: false },
    })) > 0
  ) {
    throw new Error(
      "The user with this email address has an unverified account. Please ask them to verify their email before sending an invitation."
    )
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
      token: encrypt(generateId()),
      roleId: role.id,
    },
  })
}

export async function getProjectInvitations({
  includeExpired = false,
}: {
  includeExpired: boolean
}): Promise<ProjectInvitationWithProjectAndRole[]> {
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
      expiresAt: includeExpired ? undefined : { gt: new Date() },
    },
    include: {
      project: true,
      role: true,
    },
  })
}

export async function getProjectInvitation(
  token: string
): Promise<ProjectInvitationWithProjectAndRole | null> {
  const encryptedToken = encrypt(token)
  return await prisma.projectInvitation.findUnique({
    where: {
      token: encryptedToken,
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
  roleId,
}: {
  projectId: string
  invitationId: string
  roleId: string
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
    (memberRole) => memberRole.id === roleId
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
}): Promise<ProjectInvitationWithProject> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return unauthorized()
  }

  const encryptedToken = isEncrypted(token) ? token : encrypt(token)
  const invitation = await prisma.projectInvitation.findUnique({
    where: {
      token: encryptedToken,
      email: session.user.email,
    },
  })

  if (!invitation) {
    return notFound()
  }

  const memberCount = await prisma.projectMember.count({
    where: { projectId: invitation.projectId },
  })

  const memberLimit = await prisma.project
    .findUnique({
      where: { id: invitation.projectId },
      select: { plan: { select: { membersLimit: true } } },
    })
    .then((project) => project?.plan.membersLimit)

  if (memberLimit && memberCount >= memberLimit) {
    throw new Error(
      "This project has reached the maximum number of members allowed by the current plan."
    )
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
    include: {
      project: true,
    },
  })
}

export async function declineProjectInvitation({
  token,
}: {
  token: string
}): Promise<ProjectInvitationWithProject> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return unauthorized()
  }

  const encryptedToken = isEncrypted(token) ? token : encrypt(token)
  const invitation = await prisma.projectInvitation.findUnique({
    where: {
      token: encryptedToken,
      email: session.user.email,
    },
  })

  if (!invitation) {
    return notFound()
  }

  return await prisma.projectInvitation.delete({
    where: {
      id: invitation.id,
    },
    include: {
      project: true,
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
