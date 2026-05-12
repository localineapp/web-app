"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FolderOpenIcon, HomeIcon, LucideIcon } from "lucide-react";

const navigationItems: { name: string; icon: LucideIcon; href: string }[] = [
  { name: "Dashboard", icon: HomeIcon, href: "/" },
  { name: "Projects", icon: FolderOpenIcon, href: "/projects" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex h-full flex-col border-r bg-card w-64">
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Localine Logo"
            width={32}
            height={32}
            preload={true}
            className="object-contain h-auto w-auto"
          />
          <span className="text-lg font-semibold">Localine</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigationItems.map(({ name, icon: Icon, href }) => (
            <Link key={href} href={href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 py-4 text-base",
                  isActive(href) ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
                {name}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}