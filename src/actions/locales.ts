"use server"

import { Locale } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { forbidden, notFound, unauthorized } from "next/navigation"
import { generateId } from "better-auth"
import { chunkArray } from "@/lib/utils"

export async function getLocales({
  includeDisabled,
}: {
  includeDisabled?: boolean
}): Promise<Locale[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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
    return forbidden()
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

export async function importLocales(
  locales: {
    displayName: string
    language: string
    region?: string | null
    code: string
    flag?: string | null
    enabled?: boolean
  }[]
): Promise<{
  total: number
  created: number
  updated: number
}> {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        locales: ["create"],
      },
    },
  })

  if (!hasPermission) {
    return forbidden()
  }

  const startTime = Date.now()
  for (const batch of chunkArray(locales, 25)) {
    await Promise.all(
      batch.map(
        async (locale) =>
          await prisma.locale.upsert({
            where: {
              code: locale.code,
            },
            update: {
              displayName: `${locale.language}${locale.region ? ` (${locale.region})` : ""}`,
              language: locale.language,
              region: locale.region ?? null,
              flag: locale.flag ?? null,
              enabled: locale.enabled ?? true,
            },
            create: {
              id: generateId(),
              displayName: `${locale.language}${locale.region ? ` (${locale.region})` : ""}`,
              language: locale.language,
              region: locale.region ?? null,
              code: locale.code,
              flag: locale.flag ?? null,
              enabled: locale.enabled ?? true,
            },
          })
      )
    )
  }

  const total = locales.length
  const created = await prisma.locale.count({
    where: {
      code: {
        in: locales.map((locale) => locale.code),
      },
      createdAt: {
        gte: new Date(startTime),
      },
    },
  })
  const updated = total - created

  return { total, created, updated }
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
    return forbidden()
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
    return forbidden()
  }

  if ((await prisma.locale.count({ where: { id } })) === 0) {
    return notFound()
  }

  return await prisma.locale.delete({
    where: { id },
  })
}
