import { ProjectInvitation } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"
import { isEmailVerificationRequired } from "@/actions/get-env"
import { encrypt } from "@/lib/crypto"
import {
  FullProject,
  ProjectInvitationWithProjectAndRole,
} from "@/types/project"

export async function getInvitations({
  userId,
  includeExpired = false,
}: {
  userId: string
  includeExpired?: boolean
}): Promise<ProjectInvitationWithProjectAndRole[]> {
  return await prisma.projectInvitation.findMany({
    where: {
      user: {
        id: userId,
      },
      expiresAt: includeExpired ? undefined : { gt: new Date() },
    },
    include: {
      project: true,
      role: true,
    },
  })
}

export async function getInvitation({
  userId,
  token,
}: {
  userId: string
  token: string
}): Promise<ProjectInvitationWithProjectAndRole | null> {
  const encryptedToken = encrypt(token)
  return await prisma.projectInvitation.findUnique({
    where: {
      user: {
        id: userId,
      },
      token: encryptedToken,
    },
    include: {
      project: true,
      role: true,
    },
  })
}

export async function createInvitation({
  project,
  email,
  roleId,
}: {
  project: FullProject
  email: string
  roleId: string
}): Promise<ProjectInvitation> {
  if (project.invitations.some((invitation) => invitation.email === email)) {
    throw new Error(
      "An invitation has already been sent to this email address."
    )
  }

  const role = project.memberRoles.find((role) => role.id === roleId)
  if (!role) {
    throw new Error(
      `A role with the ID "${roleId}" does not exist in this project.`
    )
  }

  if (role.id === project.id) {
    throw new Error("The owner role can't be assigned to new members.")
  }

  if (
    (await isEmailVerificationRequired()) &&
    (await prisma.user.count({
      where: { email, emailVerified: false },
    })) > 0
  ) {
    throw new Error(
      "The user with this email address has not verified their email yet. Please ask them to verify their email before sending an invitation."
    )
  }

  if (
    (await prisma.projectMember.count({
      where: { projectId: project.id, user: { email } },
    })) > 0
  ) {
    throw new Error(
      "The user with this email address is already a member of the project."
    )
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

export async function updateInvitation({
  project,
  invitationId,
  roleId,
  expiresAt,
}: {
  project: FullProject
  invitationId: string
  roleId?: string
  expiresAt?: Date
}): Promise<ProjectInvitation> {
  if (roleId === undefined && expiresAt === undefined) {
    throw new Error(
      "At least one of the update fields (roleId or expiresAt) must be provided."
    )
  }

  if (expiresAt) {
    if (expiresAt.getTime() < Date.now()) {
      throw new Error("The expiration date must be in the future.")
    }

    if (expiresAt.getTime() > Date.now() + 30 * 24 * 60 * 60 * 1000) {
      throw new Error(
        "The expiration date can't be more than 30 days in the future."
      )
    }
  }

  const invitation = project.invitations.find((inv) => inv.id === invitationId)
  if (!invitation) {
    throw new Error(
      `No invitation with the ID "${invitationId}" found in this project.`
    )
  }

  const role = project.memberRoles.find((role) => role.id === roleId)
  if (!role) {
    throw new Error(
      `A role with the ID "${roleId}" does not exist in this project.`
    )
  }

  if (role.id === project.id) {
    throw new Error("The owner role can't be assigned to new members.")
  }

  return await prisma.projectInvitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      roleId: roleId ? role.id : undefined,
      expiresAt: expiresAt ? expiresAt : undefined,
    },
  })
}

export async function deleteInvitation({
  project,
  invitationId,
}: {
  project: FullProject
  invitationId: string
}): Promise<ProjectInvitation> {
  const invitation = project.invitations.find((inv) => inv.id === invitationId)
  if (!invitation) {
    throw new Error(
      `No invitation with the ID "${invitationId}" found in this project.`
    )
  }

  return await prisma.projectInvitation.delete({
    where: {
      projectId: project.id,
      id: invitation.id,
    },
  })
}
