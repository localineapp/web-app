"use client"

import {
  Link2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  SearchIcon,
  ShieldCogIcon,
  UserCog2Icon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { authClient, signOut, useSession } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeModeSelector } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getProjects } from "@/actions/projects"

export default function AppHeader({
  session,
  projects,
}: {
  session: ReturnType<typeof useSession>["data"]
  projects: Awaited<ReturnType<typeof getProjects>>
}) {
  const router = useRouter()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const user = session?.user
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjects = normalizedSearchQuery
    ? projects.filter(
        (project) =>
          (project.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (project.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : []

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) return
      if (!searchContainerRef.current?.contains(target)) {
        setSearchQuery("")
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [])

  const handleSignOut = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setLoading(true)

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully")
          router.push("/")
        },
        onError: ({ error }) => {
          toast.error(error?.message || "Unable to sign out. Please try again.")
          setLoading(false)
        },
      },
    })
  }

  const handleStopImpersonation = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.admin.stopImpersonating({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Stopped impersonation successfully")
          setLoading(false)
          router.push("/admin/users")
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Unable to stop impersonation. Please try again."
          )
          setLoading(false)
        },
      },
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <SidebarTrigger className="shrink-0" />
        <div ref={searchContainerRef} className="relative w-full max-w-md">
          <div className="relative flex items-center">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or ID..."
              value={searchQuery}
              disabled={loading || projects.length === 0}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              className="pl-10"
            />
          </div>

          {normalizedSearchQuery.length > 0 && (
            <div className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
              <div className="max-h-72 overflow-y-auto p-1">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="truncate font-medium">
                        {project.name}
                      </span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                        {project.id.slice(0, 8)}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No projects found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeModeSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center gap-2 hover:bg-muted/80 sm:rounded-full sm:bg-muted sm:px-3 sm:py-1">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={user?.name || "Unknown User"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-xs truncate text-sm font-medium text-foreground sm:inline-block">
                {user?.name || "Unknown User"}
              </span>
              {user?.role === "admin" && (
                <UserCog2Icon className="hidden h-4 w-4 text-yellow-500 sm:inline" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-fit">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Your Account</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/account")}
              >
                <UserIcon className="h-4 w-4" aria-hidden />
                Public Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/account/sessions")}
              >
                <MonitorSmartphoneIcon className="h-4 w-4" aria-hidden />
                Sessions
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/account/security")}
              >
                <ShieldCogIcon className="h-4 w-4" aria-hidden />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/account/connections")}
              >
                <Link2Icon className="h-4 w-4" aria-hidden />
                Connections
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {session?.session.impersonatedBy === null ? (
                <DropdownMenuItem
                  variant="destructive"
                  className={cn(
                    "cursor-pointer",
                    loading && "cursor-not-allowed opacity-50"
                  )}
                  disabled={loading}
                  onClick={handleSignOut}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" aria-hidden />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOutIcon className="h-4 w-4" aria-hidden />
                      Sign Out
                    </>
                  )}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant="destructive"
                  className={cn(
                    "cursor-pointer",
                    loading && "cursor-not-allowed opacity-50"
                  )}
                  disabled={loading}
                  onClick={handleStopImpersonation}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" aria-hidden />
                      Stopping impersonation...
                    </>
                  ) : (
                    <>
                      <UserCog2Icon className="h-4 w-4" aria-hidden />
                      Stop Impersonation
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
