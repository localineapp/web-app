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
import { AlertTriangleIcon, HomeIcon } from "lucide-react"
import Link from "next/link"

export function InvitationNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>

        <EmptyTitle className="text-4xl">Invitation Not Found</EmptyTitle>

        <EmptyDescription className="text-lg">
          The invitation you are looking for does not exist.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="flex-row justify-center gap-2">
        <Button asChild size="lg">
          <Link href="/">
            <HomeIcon className="mr-2 h-5 w-5" />
            Go back to dashboard
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function InvitationExpired() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>

        <EmptyTitle className="text-4xl">Invitation Expired</EmptyTitle>

        <EmptyDescription className="text-lg">
          This invitation has expired and can no longer be accepted.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="flex-row justify-center gap-2">
        <Button asChild size="lg">
          <Link href="/">
            <HomeIcon className="mr-2 h-5 w-5" />
            Go back to dashboard
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
