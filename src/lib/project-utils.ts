import * as LucideIcons from "lucide-react"
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

export function getIcon(
  iconName: string | null | undefined
): ComponentType<SVGProps<SVGSVGElement>> | undefined {
  if (!iconName || !(iconName in LucideIcons)) return undefined
  return LucideIcons[iconName as keyof typeof LucideIcons] as ComponentType<
    SVGProps<SVGSVGElement>
  >
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

export function normalizeHexColor(color?: string | null): string | null {
  if (!color || !color.trim()) return null

  const normalizedColor = color.trim().toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
    throw new Error("Color must be a valid hex code in the format #RRGGBB.")
  }

  return normalizedColor
}