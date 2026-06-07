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
import { useEffect, useRef, useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  HistoryIcon,
  InfoIcon,
  MousePointerClickIcon,
  SaveIcon,
  SearchIcon,
} from "lucide-react"
import TablePagination from "@/components/dashboard/TablePagination"
import { ProjectLocale, ProjectTerm } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { upsertProjectTranslation } from "@/actions/project-translations"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export default function TranslationsCard({
  project,
  locale,
  canTranslate,
}: {
  project: FullProject
  locale: ProjectLocaleWithLocale
  canTranslate: boolean
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

      <CardContent>
        <TranslationsCardContent
          terms={project.terms}
          locale={locale}
          referenceLocale={referenceLocale}
          canTranslate={canTranslate}
        />
      </CardContent>
    </Card>
  )
}

const PAGE_SIZE = 5

function TranslationsCardContent({
  terms,
  locale,
  referenceLocale,
  canTranslate,
}: {
  terms: FullProject["terms"]
  locale: ProjectLocale
  referenceLocale: ProjectLocaleWithLocale | null
  canTranslate: boolean
}) {
  const router = useRouter()

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [currentTerm, setCurrentTerm] = useState<ProjectTerm | null>(null)
  const [currentTranslations, setCurrentTranslations] = useState<
    Record<string, string>
  >({})

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjectTerms = normalizedSearchQuery
    ? terms.filter((term) =>
        (term.key ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : terms

  const total = filteredProjectTerms.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentProjectTerms = filteredProjectTerms.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s"
      if (!isSaveShortcut) return

      event.preventDefault()
      event.stopPropagation()

      if (!currentTerm) return

      const termId = currentTerm.id
      const value = currentTranslations[termId]

      if (value === undefined) return

      saveTranslation(termId)
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })

    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTerm, currentTranslations])

  async function saveTranslation(termId: string) {
    const newValue = currentTranslations[termId]
    if (newValue === undefined) return

    setLoading(true)

    await upsertProjectTranslation({
      projectId: locale.projectId,
      termId,
      localeId: locale.id,
      value: newValue == "" ? null : newValue,
    })
      .then((translation) => {
        toast.success(`Translation saved for term "${translation.term.key}".`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "An error occurred while saving the translation."
        )
      })
      .finally(() => {
        setLoading(false)
        setCurrentTerm(null)
        setCurrentTranslations((prev) => {
          if (prev[termId] !== newValue) return prev

          const { [termId]: _, ...rest } = prev
          return rest
        })
      })
  }

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search terms by key..."
          value={searchQuery}
          onChange={({ target: { value } }) => {
            setSearchQuery(value)
            setPage(1)
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-32">Key</TableHead>
              <TableHead className="text-center">Translation</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjectTerms.length > 0 ? (
              currentProjectTerms.map((term) => {
                const originalValue =
                  term.translations.find((t) => t.localeId === locale.id)
                    ?.value ?? ""
                const currentValue =
                  currentTranslations[term.id] ?? originalValue
                const hasUnsavedChanges = currentValue !== originalValue

                return (
                  <TableRow
                    key={term.id}
                    ref={(el) => {
                      rowRefs.current[term.id] = el
                    }}
                  >
                    <TableCell className="max-w-32">{term.key}</TableCell>

                    <TableCell className="w-full max-w-0">
                      <Textarea
                        value={currentValue}
                        readOnly={!canTranslate}
                        className={cn(
                          "max-h-48 min-h-15 w-full resize-none overflow-y-auto border-0 bg-transparent p-1 text-xl placeholder:text-lg",
                          hasUnsavedChanges
                            ? "ring-2 ring-amber-300 dark:ring-amber-500"
                            : "ring-1 ring-transparent",
                          currentTerm?.id === term.id ? "ring-3" : ""
                        )}
                        disabled={loading}
                        placeholder="Enter translation..."
                        onFocus={() => {
                          if (!canTranslate) return

                          setCurrentTerm(term)
                          setCurrentTranslations((prev) => {
                            if (term.id in prev) return prev

                            return {
                              ...prev,
                              [term.id]: originalValue,
                            }
                          })
                        }}
                        onBlur={(e) => {
                          const nextFocused = e.relatedTarget as Node | null
                          if (
                            nextFocused &&
                            rowRefs.current[term.id]?.contains(nextFocused)
                          )
                            return

                          setCurrentTerm((prev) =>
                            prev?.id === term.id ? null : prev
                          )

                          setCurrentTranslations((prev) => {
                            if (!hasUnsavedChanges) {
                              const { [term.id]: _, ...rest } = prev
                              return rest
                            }

                            return prev
                          })
                        }}
                        onChange={({ target: { value } }) =>
                          setCurrentTranslations((prev) => ({
                            ...prev,
                            [term.id]: value,
                          }))
                        }
                      />

                      {currentTerm?.id === term.id && referenceLocale && (
                        <>
                          {term.translations.some(
                            (t) => t.localeId === referenceLocale.id
                          ) ? (
                            <>
                              <Separator className="my-2" />

                              <div className="mt-2 flex items-center gap-2">
                                <MousePointerClickIcon className="h-4 w-4 text-green-600 dark:text-green-500" />
                                <p className="text-xs text-green-600 italic dark:text-green-500">
                                  Found reference translation in{" "}
                                  {referenceLocale.locale.displayName}
                                </p>
                              </div>

                              <Card data-reference-card className="mt-2 border">
                                <CardContent>
                                  <Textarea
                                    value={
                                      term.translations.find(
                                        (t) => t.localeId === referenceLocale.id
                                      )?.value ?? ""
                                    }
                                    readOnly
                                    className="max-h-48 min-h-15 w-full resize-none overflow-y-auto border-0 bg-transparent p-1 text-xl"
                                  />
                                </CardContent>
                              </Card>
                            </>
                          ) : (
                            <div className="mt-2 flex items-center gap-2">
                              <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                              <p className="text-xs text-amber-600 italic dark:text-amber-500">
                                No reference translation available
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </TableCell>

                    <TableCell className="w-0">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="disabled:invisible"
                          disabled={!hasUnsavedChanges || loading}
                          onClick={() => saveTranslation(term.id)}
                        >
                          <SaveIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="disabled:invisible"
                          disabled={!hasUnsavedChanges || loading}
                          onClick={() => {
                            setCurrentTerm(term)
                            setCurrentTranslations((prev) => ({
                              ...prev,
                              [term.id]: originalValue,
                            }))
                          }}
                        >
                          <HistoryIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No terms found matching your search."
                    : "No terms found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={displayStartIndex}
        endIndex={endIndex}
        total={total}
        setPage={setPage}
      />
    </>
  )
}
