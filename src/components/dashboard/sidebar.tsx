"use client"

import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Sidebar() {
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
          
        </nav>
      </ScrollArea>
    </div>
  )
}