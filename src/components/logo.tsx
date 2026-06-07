import { cn } from "@/lib/utils"
import Image from "next/image"

export default function LocalineLogo({
  height = 32,
  width = 32,
  preload = true,
  className,
}: {
  height?: number
  width?: number
  preload?: boolean
  className?: string
}) {
  return (
    <Image
      src="/logo.png"
      alt="Localine Logo"
      width={width}
      height={height}
      preload={preload}
      className={cn("object-contain", className)}
    />
  )
}
