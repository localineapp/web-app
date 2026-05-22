import { Prisma } from "@prisma/client"

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
    plan: true,
  },
})

export type FullProject = Prisma.ProjectGetPayload<{
  include: typeof fullProjectArgs.include
}>
