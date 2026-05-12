"use client"

import {
  FolderCogIcon,
  Link2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  SearchIcon,
  ShieldCogIcon,
  UserCog2Icon,
  UserIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { MouseEvent, useState } from "react"
import { signOut, useSession } from "@/lib/auth-client"
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
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export default function Header({
  session,
}: {
  session: ReturnType<typeof useSession>["data"]
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [signingOut, setSigningOut] = useState(false)

  const user = session?.user

  const handleSignOut = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setSigningOut(true)

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully")
          router.push("/")
        },
        onError(context) {
          toast.error(
            context.error?.message || "Unable to sign out. Please try again."
          )
          setSigningOut(false)
        },
      },
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4">
      <div className="relative flex items-center gap-4">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeModeSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center gap-2 hover:bg-muted/80 sm:rounded-full sm:bg-muted sm:px-3 sm:py-1">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.image || ""}
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
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Your Account</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account")}> 
                <UserIcon className="h-4 w-4" aria-hidden />
                Public Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account/sessions")}>
                <MonitorSmartphoneIcon className="h-4 w-4" aria-hidden />
                Sessions
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account/security")}>
                <ShieldCogIcon className="h-4 w-4" aria-hidden />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account/connections")}>
                <Link2Icon className="h-4 w-4" aria-hidden />
                Connections
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {user?.role === "admin" && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Administration</DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCog2Icon className="h-4 w-4" aria-hidden />
                    Users
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <FolderCogIcon className="h-4 w-4" aria-hidden />
                    Projects
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className={cn(
                  "cursor-pointer",
                  signingOut && "cursor-not-allowed opacity-50"
                )}
                disabled={signingOut}
                onClick={handleSignOut}
              >
                {signingOut ? (
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
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
