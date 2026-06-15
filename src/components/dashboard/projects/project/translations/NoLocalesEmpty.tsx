"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { GlobeIcon, GlobeOffIcon } from "lucide-react"
import Link from "next/link"

export default function NoLocalesEmpty() {
  return (
    <div className="flex min-h-full flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GlobeOffIcon />
          </EmptyMedia>

          <EmptyTitle className="text-4xl">No Locales</EmptyTitle>

          <EmptyDescription className="text-lg">
            In order to add translations, you need at least one locale being
            added to your project.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild size="lg">
            <Link href="locales">
              <GlobeIcon className="mr-2 h-5 w-5" />
              Go to Locales
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}