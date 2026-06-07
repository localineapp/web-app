import { Locale, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { generateId } from "better-auth"

const validateLocaleInput = ({
  displayName,
  language,
  region,
  code,
  flag,
}: {
  displayName?: string
  language?: string
  region?: string | null
  code?: string
  flag?: string | null
}) => {
  const normalizedDisplayName = displayName?.trim()
  if (displayName && !normalizedDisplayName) {
    throw new Error("A locale displayName is required.")
  }

  if (normalizedDisplayName && normalizedDisplayName.length > 255) {
    throw new Error("A locale displayName must be 255 characters or less.")
  }

  const normalizedLanguage = language?.trim()
  if (language && !normalizedLanguage) {
    throw new Error("A locale language is required.")
  }

  if (normalizedLanguage && normalizedLanguage.length > 255) {
    throw new Error("A locale language must be 255 characters or less.")
  }

  const normalizedRegion = region?.trim() || null
  if (region && normalizedRegion && normalizedRegion.length > 255) {
    throw new Error("A locale region must be 255 characters or less.")
  }

  const normalizedCode = code?.trim()
  if (code && !normalizedCode) {
    throw new Error("A locale code is required.")
  }

  if (normalizedCode && normalizedCode.length > 255) {
    throw new Error("A locale code must be 255 characters or less.")
  }

  const normalizedFlag = flag?.trim() || null
  if (flag && normalizedFlag && normalizedFlag.length > 255) {
    throw new Error("A locale flag must be 255 characters or less.")
  }
}

export const LocalesService = {
  async getLocales(
    includeDisabled = false,
    orderBy: Prisma.LocaleOrderByWithRelationInput = {
      createdAt: "asc",
    }
  ): Promise<Locale[]> {
    return prisma.locale.findMany({
      where: {
        enabled: includeDisabled ? undefined : true,
      },
      orderBy,
    })
  },

  async getLocale(localeId: string): Promise<Locale | null> {
    return prisma.locale.findUnique({
      where: {
        id: localeId,
      },
    })
  },

  async createLocale({
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
    validateLocaleInput({
      displayName,
      language,
      region,
      code,
      flag,
    })

    if ((await prisma.locale.count({ where: { code } })) > 0) {
      throw new Error(`Locale with code "${code}" already exists.`)
    }

    return prisma.locale.create({
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
  },

  async updateLocale(
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
    validateLocaleInput({
      displayName,
      language,
      region,
      code,
      flag,
    })

    const existingLocale = await prisma.locale.findUnique({
      where: {
        id,
      },
    })

    if (!existingLocale) {
      throw new Error(`No locale with the ID "${id}" found.`)
    }

    if (code && code !== existingLocale.code) {
      if ((await prisma.locale.count({ where: { code } })) > 0) {
        throw new Error(`Locale with code "${code}" already exists.`)
      }
    }

    return prisma.locale.update({
      where: {
        id,
      },
      data: {
        displayName,
        language,
        region,
        code,
        flag,
        enabled,
      },
    })
  },

  async deleteLocale(id: string): Promise<Locale> {
    return await prisma.locale.delete({
      where: {
        id,
      },
    })
  },
}
