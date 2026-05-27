import * as LucideIcons from "lucide-react"
import { ComponentType, CSSProperties, SVGProps } from "react"

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
