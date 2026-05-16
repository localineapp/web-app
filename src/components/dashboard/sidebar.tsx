"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FolderOpenIcon,
  FoldersIcon,
  GlobeIcon,
  HomeIcon,
  LucideIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"

type NavigationItem = {
  name: string
  icon: LucideIcon
  href: string
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", icon: HomeIcon, href: "/" },
  { name: "Projects", icon: FolderOpenIcon, href: "/projects" },
]

const adminNavigationItems: NavigationItem[] = [
  { name: "Users", icon: UsersIcon, href: "/admin/users" },
  { name: "Projects", icon: FoldersIcon, href: "/admin/projects" },
  { name: "Locales", icon: GlobeIcon, href: "/admin/locales" },
  { name: "Plans", icon: PackageIcon, href: "/admin/plans" },
]

export default function AppSidebar({
  session,
}: {
  session: ReturnType<typeof useSession>["data"]
}) {
  const pathname = usePathname()

  const user = session?.user

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Localine Logo"
            width={32}
            height={32}
            preload={true}
            className="h-auto w-auto object-contain"
          />
          <span className="text-lg font-semibold">Localine</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {navigationItems.map(({ name, icon: Icon, href }) => (
            <Link key={name} href={href} passHref>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-4 py-4 text-base",
                  isActive(href)
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Button>
            </Link>
          ))}
        </SidebarGroup>
        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            {adminNavigationItems.map(({ name, icon: Icon, href }) => (
              <Link key={name} href={href} passHref>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-4 py-4 text-base",
                    isActive(href)
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </Button>
              </Link>
            ))}
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
