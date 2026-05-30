"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CogIcon, SendIcon } from "lucide-react"
import { authClient, useSession } from "@/lib/auth-client"
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
import { Project, ProjectInvitation } from "@prisma/client"
import { useEffect, useState } from "react"
import { getProject } from "@/actions/projects"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import LocalineLogo from "@/components/logo"
import {
  accountNavigationItems,
  adminNavigationItems,
  navigationItems,
  projectNavigationItems,
  projectSettingsNavigationItems,
} from "@/components/dashboard/navigation-items"
import { Badge } from "@/components/ui/badge"

export default function AppSidebar({
  appName,
  session,
  invitations,
}: {
  appName: string
  session: ReturnType<typeof useSession>["data"]
  invitations: ProjectInvitation[]
}) {
  const pathname = usePathname()
  const { state } = useSidebar()

  const user = session?.user

  const [project, setProject] = useState<Project | null>(null)
  const [canAccessAdmin, setCanAccessAdmin] = useState(false)

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

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data, error } = await authClient.admin.hasPermission({
        permissions: {
          dashboard: ["admin"],
        },
      })

      if (error) {
        setCanAccessAdmin(false)
      } else {
        setCanAccessAdmin(data?.success || false)
      }
    }

    checkAdminAccess()
  }, [user])

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.endsWith(href + "/")
  }

  const isExpanded = state === "expanded"

  const isAccountPage = accountNavigationItems.some(({ href }) =>
    isActive(href)
  )

  const isProjectPage =
    projectNavigationItems.some(({ href }) =>
      isActive(href.replace("[projectId]", project?.id || ""))
    ) ||
    projectSettingsNavigationItems.some(({ href }) =>
      isActive(href.replace("[projectId]", project?.id || ""))
    )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <Link
          href="/"
          className={cn(
            "flex items-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
            isExpanded ? "gap-2" : "justify-center"
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-lg">
            <LocalineLogo />
          </div>
          {isExpanded && (
            <div className="grid flex-1 text-left">
              <span className="truncate text-lg font-semibold">{appName}</span>
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

        {invitations.length > 0 && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-4 py-4 text-base font-medium",
                    isActive("/invitations")
                  )}
                >
                  <Link href="/invitations" passHref>
                    <SendIcon className="h-4 w-4" />
                    <span>Invitations</span>
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium">
                      {invitations.length}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {isAccountPage && (
          <SidebarGroup>
            {isExpanded && <SidebarGroupLabel>Your Account</SidebarGroupLabel>}

            <SidebarMenu>
              {accountNavigationItems.map(({ name, icon: Icon, href }) => (
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

        {isProjectPage && project && (
          <SidebarGroup>
            {isExpanded && (
              <SidebarGroupLabel>{project.name}</SidebarGroupLabel>
            )}

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
        {canAccessAdmin && (
          <SidebarGroup>
            {isExpanded && (
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
            )}

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
