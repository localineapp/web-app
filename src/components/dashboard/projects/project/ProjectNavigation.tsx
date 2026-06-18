"use client"

import { useProject } from "@/components/project-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function ProjectNavigation({
  description,
  href = "/projects",
}: {
  description?: string
  href?: string
}) {
  const { project } = useProject()

  return (
    <div className="flex w-full items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={href}>
          <ArrowLeftIcon />
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold">
          {project?.name ?? "Invalid Project"}
        </h1>
        <p className="text-muted-foreground">
          {description ?? project?.description ?? "No description."}
        </p>
      </div>
    </div>
  )
}
