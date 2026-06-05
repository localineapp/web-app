"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FullProject, ProjectLocaleWithLocale } from "@/types/project"
import ReferencePopover from "./ReferencePopover"
import { useState } from "react"

export default function TranslationsCard({
  project,
  locale,
}: {
  project: FullProject
  locale: ProjectLocaleWithLocale
}) {
  const [referenceLocale, setReferenceLocale] =
    useState<ProjectLocaleWithLocale | null>(null)

  return (
    <Card>
      <CardHeader className="flex">
        <div>
          <CardTitle className="text-lg">
            Translations for {locale.locale.displayName}
          </CardTitle>
          <CardDescription>
            {
              project.terms.filter((term) =>
                term.translations.some(
                  (translation) => translation.localeId === locale.id
                )
              ).length
            }{" "}
            of {project.terms.length} terms have translations in this locale.
          </CardDescription>
        </div>

        <div className="ml-auto">
          <ReferencePopover
            projectLocales={project.locales}
            currentLocale={locale}
            referenceLocale={referenceLocale}
            setReferenceLocale={setReferenceLocale}
          />
        </div>
      </CardHeader>

      <CardContent></CardContent>
    </Card>
  )
}
