"use client"

import { SearchIcon, UserCog2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeModeSelector } from "@/components/theme-provider";

export default function Header({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const user = session?.user;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4">
      <div className="flex relative items-center gap-4">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeModeSelector />

        <div className="sm:rounded-full sm:bg-muted sm:px-3 sm:py-1 flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image || ""} alt={user?.name || "Unknown User"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block max-w-xs truncate text-sm font-medium text-foreground">
            {user?.name || "Unknown User"}
          </span>
          {user?.role === "admin" && (
            <UserCog2Icon className="hidden sm:inline h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>
    </header>
  )
}