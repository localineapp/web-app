"use server"

import { Locale } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { forbidden, unauthorized } from "next/navigation"
import { generateId } from "better-auth"
import { chunkArray } from "@/lib/utils"
import { LocalesService } from "@/services/locales"

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

  if (
    includeDisabled &&
    !(await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: session.user.role ?? "user",
        permissions: {
          locales: ["read:disabled"],
        },
      },
    }))
  ) {
    includeDisabled = false
  }

  return await LocalesService.getLocales(includeDisabled)
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

  return await LocalesService.createLocale({
    displayName,
    language,
    region,
    code,
    flag,
    enabled,
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
  localeId: string,
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

  return await LocalesService.updateLocale(localeId, {
    displayName,
    language,
    region,
    code,
    flag,
    enabled,
  })
}

export async function deleteLocale(localeId: string): Promise<Locale> {
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

  return await LocalesService.deleteLocale(localeId)
}
