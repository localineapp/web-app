"use server"

import { Locale } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound, unauthorized } from "next/navigation"
import { generateId } from "better-auth"
import { useSession } from "@/lib/auth-client"

export async function getLocales({
  session,
  includeDisabled,
}: {
  session: ReturnType<typeof useSession>["data"]
  includeDisabled?: boolean
}): Promise<Locale[]> {
  if (!session || !session.user) {
    return unauthorized()
  }

  return prisma.locale.findMany({
    where: {
      enabled: includeDisabled ? undefined : true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })
}

export async function createLocale({
  displayName,
  language,
  region,
  code,
  flag,
  enabled,
}: {
  displayName: string
  language: string
  region?: string | null
  code: string
  flag?: string | null
  enabled?: boolean
}): Promise<Locale> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        locales: ["create"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
  }

  if ((await prisma.locale.count({ where: { code } })) > 0) {
    throw new Error(`Locale with code ${code} already exists.`)
  }

  return await prisma.locale.create({
    data: {
      id: generateId(),
      displayName,
      language,
      region,
      code,
      flag,
      enabled,
    },
  })
}

export async function updateLocale(
  id: string,
  {
    displayName,
    language,
    region,
    code,
    flag,
    enabled,
  }: {
    displayName?: string
    language?: string
    region?: string | null
    code?: string
    flag?: string | null
    enabled?: boolean
  }
): Promise<Locale> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        locales: ["update"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
  }

  return await prisma.locale.update({
    where: { id },
    data: { displayName, language, region, code, flag, enabled },
  })
}

export async function deleteLocale(id: string): Promise<Locale> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        locales: ["delete"],
      },
    },
  })

  if (!hasPermission) {
    return unauthorized()
  }

  if ((await prisma.locale.count({ where: { id } })) === 0) {
    return notFound()
  }

  return await prisma.locale.delete({
    where: { id },
  })
}
