import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FullProject, fullProjectArgs } from "@/types/project"
import { User as PrismaUser } from "@prisma/client"
import { User } from "better-auth"

export async function findProject(
  projectId: string,
  user: PrismaUser | User | null
): Promise<FullProject | null> {
  const hasPermissions = (
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

  return hasPermissions
    ? await prisma.project.findUnique({
        ...fullProjectArgs,
        where: {
          id: projectId,
        },
      })
    : await prisma.project.findFirst({
        ...fullProjectArgs,
        where: {
          id: projectId,
          members: {
            some: {
              userId: user?.id,
            },
          },
        },
      })
}
