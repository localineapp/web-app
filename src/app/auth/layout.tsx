import { BackgroundPattern } from "@/components/background-pattern";
import { Key, Languages, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-muted p-10 text-foreground relative overflow-hidden">
        <BackgroundPattern />
        
        <Link href="/" className="flex items-center gap-2 font-semibold relative z-10">
          <Image src="/logo.png" alt="Localine Logo" width={24} height={24} className="object-contain" />
          <span className="text-xl">Localine</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <blockquote className="space-y-4">
            <p className="text-lg">
              &ldquo;The open translation management platform that helps teams
              collaborate on localization. Simple, fast, and developer-friendly.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              — Manage translations across all your projects
            </footer>
          </blockquote>
        </div>
        <div className="mt-auto relative z-10">
          <div className="flex gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span>Multiple formats</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>API access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}