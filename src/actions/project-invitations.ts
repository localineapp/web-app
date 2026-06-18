"use server"

import { ProjectInvitation, ProjectMember } from "@prisma/client"
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
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
  updateInvitation,
} from "@/services/project-invitations"

export async function getProjectInvitations(
  includeExpired = false
): Promise<ProjectInvitationWithProjectAndRole[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return await getInvitations({
    userId: session.user.id,
    includeExpired,
  })
}

export async function getProjectInvitation(
  token: string
): Promise<ProjectInvitationWithProjectAndRole | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return await getInvitation({
    userId: session.user.id,
    token,
  })
}

export async function createProjectInvitation({
  projectId,
  email,
  roleId,
}: {
  projectId: string
  email: string
  roleId: string
}): Promise<ProjectInvitation> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.INVITE_MEMBERS,
  })

  return await createInvitation({
    project,
    email,
    roleId,
  })
}

export async function updateProjectInvitation({
  projectId,
  invitationId,
  roleId,
  expiresAt,
}: {
  projectId: string
  invitationId: string
  roleId?: string
  expiresAt?: Date
}): Promise<ProjectInvitation> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.INVITE_MEMBERS,
  })

  return await updateInvitation({
    project,
    invitationId,
    roleId,
    expiresAt,
  })
}

export async function revokeProjectInvitation({
  projectId,
  invitationId,
}: {
  projectId: string
  invitationId: string
}): Promise<ProjectInvitation> {
  const { project } = await canManageProjectFeature({
    projectId,
    permission: ProjectPermission.INVITE_MEMBERS,
  })

  return await deleteInvitation({
    project,
    invitationId,
  })
}

export async function acceptProjectInvitation({
  token,
}: {
  token: string
}): Promise<[ProjectInvitationWithProject, ProjectMember]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
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

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
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

  return await prisma.$transaction(async (tx) => {
    return [
      await tx.projectInvitation.delete({
        where: {
          id: invitation.id,
        },
        include: {
          project: true,
        },
      }),
      await tx.projectMember.create({
        data: {
          id: generateId(),
          projectId: invitation.projectId,
          userId: session.user.id,
          roleId: invitation.roleId,
        },
      }),
    ]
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

  if (!session || !session.user) {
    return unauthorized()
  }

  const encryptedToken = isEncrypted(token) ? token : encrypt(token)
  const invitation = await prisma.projectInvitation.delete({
    where: {
      token: encryptedToken,
      email: session.user.email,
    },
    include: {
      project: true,
    },
  })

  if (!invitation) {
    return notFound()
  }

  return invitation
}
