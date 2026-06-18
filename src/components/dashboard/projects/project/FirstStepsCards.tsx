"use client"

import Link from "next/link"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProject } from "@/components/project-provider"

export default function FirstStepsCards() {
  const { project } = useProject()

  const hasLocales = project.locales.length > 0
  const hasTerms = project.terms.length > 0
  const hasTranslations = project.terms.some(
    (term) => term.translations.length > 0
  )
  const hasMembers = project.members.length > 1

  return (
    <div className="grid gap-2">
      <StepCard
        title="Add Locales"
        description="Add the locales you want to support in your project."
        href={`/projects/${project.id}/locales`}
        isCompleted={hasLocales}
      />
      <StepCard
        title="Add Terms"
        description="Add the terms you want to translate in your project."
        href={`/projects/${project.id}/terms`}
        isCompleted={hasTerms}
      />
      <StepCard
        title="Add Translations"
        description="Add translations for your terms in each locale."
        href={`/projects/${project.id}/translations`}
        isCompleted={hasTranslations}
      />
      <StepCard
        title="Invite Members"
        description="Invite team members to collaborate on your project."
        href={`/projects/${project.id}/members`}
        isCompleted={hasMembers}
      />
    </div>
  )
}

function StepCard({
  title,
  description,
  href,
  isCompleted,
}: {
  title: string
  description: string
  href: string
  isCompleted: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
              isCompleted
                ? "border-green-500 bg-green-500/10 text-green-600"
                : "border-muted-foreground/30 bg-muted text-muted-foreground"
            )}
          >
            {isCompleted ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <XIcon className="h-4 w-4" />
            )}
          </div>

          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center self-stretch">
            <Button variant="outline" asChild>
              <Link href={href} className="text-sm font-medium text-primary">
                Open
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
