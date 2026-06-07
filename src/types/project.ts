import {
  Locale,
  Prisma,
  Project,
  ProjectInvitation,
  ProjectLocale,
  ProjectMember,
  ProjectMemberRole,
  ProjectTerm,
  ProjectTranslation,
} from "@prisma/client"

export const fullProjectArgs = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    terms: {
      include: {
        translations: {
          include: {
            locale: {
              include: {
                locale: true,
              },
            },
          },
        },
        labels: true,
      },
    },
    locales: {
      include: {
        locale: true,
      },
    },
    labels: true,
    members: {
      include: {
        user: {
          omit: {
            banned: true,
            banReason: true,
            banExpires: true,
            email: true,
            emailVerified: true,
            lastLoginMethod: true,
            projectsLimit: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        role: true,
        locales: {
          include: {
            locale: true,
          },
        },
      },
    },
    memberRoles: true,
    invitations: {
      include: {
        role: true,
      },
    },
    plan: {
      omit: {
        default: true,
      },
    },
  },
})

export const projectMemberArgs =
  Prisma.validator<Prisma.ProjectMemberDefaultArgs>()({
    include: {
      user: {
        omit: {
          banned: true,
          banReason: true,
          banExpires: true,
          emailVerified: true,
          lastLoginMethod: true,
          projectsLimit: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      role: true,
      locales: {
        include: {
          locale: true,
        },
      },
    },
  })

export type FullProject = Prisma.ProjectGetPayload<{
  include: typeof fullProjectArgs.include
}>

export type ProjectTranslationWithTerm = ProjectTranslation & {
  term: ProjectTerm
}

export type ProjectLocaleWithLocale = ProjectLocale & { locale: Locale }

export type ProjectMemberWithUserAndRole = Prisma.ProjectMemberGetPayload<{
  include: typeof projectMemberArgs.include
}>

export type ProjectMemberWithLocales = ProjectMember & {
  locales: ProjectLocaleWithLocale[]
}

export type ProjectInvitationWithProject = ProjectInvitation & {
  project: Project
}

export type ProjectInvitationWithRole = ProjectInvitation & {
  role: ProjectMemberRole
}

export type ProjectInvitationWithProjectAndRole = ProjectInvitation & {
  project: Project
  role: ProjectMemberRole
}
