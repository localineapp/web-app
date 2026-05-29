import * as LucideIcons from "lucide-react"
import * as FlagIcons from "country-flag-icons/react/3x2"
import { ComponentType, CSSProperties, SVGProps } from "react"

const lucideIconNames = Object.keys(LucideIcons)
  .filter(
    (name) =>
      /^[A-Z]/.test(name) &&
      !name.startsWith("Lucide") &&
      !name.endsWith("Icon") &&
      name !== "Icon"
  )
  .sort((a, b) => a.localeCompare(b))

const flagKeys = Object.keys(FlagIcons).filter((k) => k !== "default").sort()

const flagDisplayNames: Intl.DisplayNames | null =
  typeof Intl !== "undefined" && (Intl as any).DisplayNames
    ? new (Intl as any).DisplayNames(["en"], { type: "region" })
    : null

const regionNameToFlagCode = new Map<string, string>()

for (const code of flagKeys) {
  const regionCode = code.split(/[_-]/).at(-1)
  if (!regionCode || regionCode.length !== 2 || !flagDisplayNames) continue

  try {
    const regionName = flagDisplayNames.of(regionCode)
    if (!regionName) continue

    regionNameToFlagCode.set(normalizeFlagName(regionName), code)
  } catch {
    // Some special codes are not valid region names; skip them.
  }
}

export function getIcon(
  iconName: string | null | undefined
): ComponentType<SVGProps<SVGSVGElement>> | undefined {
  if (!iconName || !(iconName in LucideIcons)) return undefined
  return LucideIcons[iconName as keyof typeof LucideIcons] as ComponentType<
    SVGProps<SVGSVGElement>
  >
}

export function getFlag(
  flagCode: string | null | undefined
): ComponentType<SVGProps<SVGSVGElement>> | undefined {
  if (!flagCode || !(flagCode.toUpperCase() in FlagIcons)) return undefined
  return FlagIcons[flagCode.toUpperCase() as keyof typeof FlagIcons] as ComponentType<
    SVGProps<SVGSVGElement>
  >
}

export function getFlagCodeForLocale(
  locale: {
    region?: string | null
    code: string
  }
): string | undefined {
  const normalizedRegion = locale.region ? normalizeFlagName(locale.region) : ""

  if (normalizedRegion) {
    const regionFlagCode = regionNameToFlagCode.get(normalizedRegion)
    if (regionFlagCode) return regionFlagCode
  }

  const normalizedCode = locale.code.trim().toUpperCase()
  if (normalizedCode in FlagIcons) return normalizedCode

  return undefined
}

export function getColorStyle(
  color: string | null | undefined
): CSSProperties | undefined {
  if (!color) return undefined
  return { "--role-color": color } as CSSProperties
}

export function getColorClassName(color: string | null | undefined): string {
  if (!color) return ""
  return "text-[color-mix(in_oklab,var(--role-color)_80%,black)] dark:text-[color-mix(in_oklab,var(--role-color)_80%,white)]"
}

export function getAllLucideIconNames(): string[] {
  return lucideIconNames
}

export function getAllFlagCodes(): string[] {
  return flagKeys
}

export function normalizeHexColor(color?: string | null): string | null {
  if (!color || !color.trim()) return null

  const normalizedColor = color.trim().toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
    throw new Error("Color must be a valid hex code in the format #RRGGBB.")
  }

  return normalizedColor
}

function normalizeFlagName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
}