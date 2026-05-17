"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronRightIcon,
  CogIcon,
  FileTextIcon,
  FolderOpenIcon,
  FoldersIcon,
  GlobeIcon,
  HomeIcon,
  LibraryIcon,
  LucideIcon,
  PackageIcon,
  ShieldCogIcon,
  SlidersHorizontalIcon,
  TagsIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Project } from "@prisma/client"
import { useEffect, useState } from "react"
import { getProject } from "@/actions/projects"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type NavigationItem = {
  name: string
  icon: LucideIcon
  href: string
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", icon: HomeIcon, href: "/" },
  { name: "Projects", icon: FolderOpenIcon, href: "/projects" },
]

const projectNavigationItems: NavigationItem[] = [
  { name: "Overview", icon: HomeIcon, href: "/projects/[projectId]" },
  {
    name: "Translations",
    icon: FileTextIcon,
    href: "/projects/[projectId]/translations",
  },
  { name: "Terms", icon: LibraryIcon, href: "/projects/[projectId]/terms" },
  { name: "Labels", icon: TagsIcon, href: "/projects/[projectId]/labels" },
  { name: "Locales", icon: GlobeIcon, href: "/projects/[projectId]/locales" },
  { name: "Members", icon: UsersIcon, href: "/projects/[projectId]/members" },
]

const projectSettingsNavigationItems: NavigationItem[] = [
  {
    name: "General",
    icon: SlidersHorizontalIcon,
    href: "/projects/[projectId]/settings",
  },
  {
    name: "Member Roles",
    icon: ShieldCogIcon,
    href: "/projects/[projectId]/settings/member-roles",
  },
  {
    name: "Workflows",
    icon: WorkflowIcon,
    href: "/projects/[projectId]/settings/workflows",
  },
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
  const { state } = useSidebar()

  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const match = pathname?.match(/\/projects\/([^/]+)/)
    const projectId = match ? match[1] : null

    if (!projectId) return

    const loadProject = async () => {
      try {
        const project = await getProject(projectId)
        setProject(project)
      } catch {
        setProject(null)
      }
    }

    loadProject()
  }, [pathname])

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.endsWith(href + "/")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <Link
          href="/"
          className={cn(
            "flex items-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
            state === "expanded" ? "gap-2" : "justify-center"
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-lg">
            <Image
              src="/logo.png"
              alt="Localine Logo"
              width={32}
              height={32}
              preload={true}
              className="object-contain"
            />
          </div>
          {state === "expanded" && (
            <div className="grid flex-1 text-left">
              <span className="truncate text-lg font-semibold">Localine</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map(({ name, icon: Icon, href }) => (
              <SidebarMenuItem key={name}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-4 py-4 text-base font-medium",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Link href={href} passHref>
                    <Icon className="h-4 w-4" />
                    {name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {project && (
          <SidebarGroup>
            <SidebarGroupLabel>{project.name}</SidebarGroupLabel>

            <SidebarMenu>
              {projectNavigationItems.map(({ name, icon: Icon, href }) => {
                const projectHref = href.replace("[projectId]", project.id)
                return (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base font-medium",
                        isActive(projectHref)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Link href={projectHref} passHref>
                        <Icon className="h-4 w-4" />
                        {name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base",
                        isActive(`/projects/${project.id}/settings`) ||
                          isActive(
                            `/projects/${project.id}/settings/member-roles`
                          ) ||
                          isActive(`/projects/${project.id}/settings/workflows`)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <CogIcon className="h-4 w-4" />
                      Settings
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {projectSettingsNavigationItems.map(
                        ({ name, icon: Icon, href }) => (
                          <SidebarMenuSubItem key={name}>
                            <SidebarMenuSubButton
                              asChild
                              size="md"
                              className={cn(
                                "w-full justify-start gap-2 py-2 text-base font-medium",
                                isActive(
                                  href.replace("[projectId]", project.id)
                                )
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <Link
                                href={href.replace("[projectId]", project.id)}
                                passHref
                              >
                                <Icon className="h-4 w-4" />
                                {name}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {session?.user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {adminNavigationItems.map(({ name, icon: Icon, href }) => (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-4 py-4 text-base font-medium",
                      isActive(href)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Link href={href} passHref>
                      <Icon className="h-4 w-4" />
                      {name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
