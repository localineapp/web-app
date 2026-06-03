"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ApiPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Localine API</h1>
        <p className="mt-3 text-muted-foreground">
          Browse the API documentation for Localine.
        </p>
      </div>

      <div className="flex min-w-40 flex-col gap-3">
        <Button asChild size="lg">
          <Link href="/api/v2">API v2</Link>
        </Button>

        <Button asChild variant="destructive" size="lg" className="h-auto py-2">
          <Link
            href="/api/v1"
            className="flex flex-col items-center leading-none"
          >
            <span>API v1</span>
            <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              deprecated
            </span>
          </Link>
        </Button>
      </div>
    </main>
  )
}
