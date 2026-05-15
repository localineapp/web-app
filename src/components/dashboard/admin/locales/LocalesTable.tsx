"use client"

import { deleteLocale, updateLocale } from "@/actions/locales"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Locale } from "@prisma/client"
import { BadgeCheckIcon, BadgeXIcon, PencilIcon, SearchIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function LocalesTable({
  locales,
  canUpdateLocales,
  canDeleteLocales,
}: {
  locales: Locale[]
  canUpdateLocales: boolean
  canDeleteLocales: boolean
}) {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingLocale, setEditingLocale] = useState<Locale | null>(null)
  const [deletingLocale, setDeletingLocale] = useState<Locale | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [language, setLanguage] = useState("")
  const [region, setRegion] = useState("")
  const [code, setCode] = useState("")
  const [flag, setFlag] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredLocales = normalizedSearchQuery
    ? locales.filter(
      (locale) =>
        (locale.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (locale.displayName ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (locale.language ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (locale.region ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (locale.code ?? "").toLowerCase().includes(normalizedSearchQuery)
    )
    : locales

  const total = filteredLocales.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentLocales = filteredLocales.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  function openEditor(locale: Locale) {
    setDisplayName(locale.displayName ?? "")
    setLanguage(locale.language ?? "")
    setRegion(locale.region ?? "")
    setCode(locale.code ?? "")
    setFlag(locale.flag)
    setEnabled(locale.enabled)
    setEditingLocale(locale)
  }

  async function handleUpdateLocale(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingLocale) return

    setLoading(true)
    await updateLocale(editingLocale.id, {
      displayName,
      language,
      region,
      code,
      flag,
      enabled,
    })
      .then(() => {
        toast.success(`Updated locale ${displayName} (${editingLocale.id.slice(0, 8)}).`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update locale. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setEditingLocale(null)
      })
  }

  async function handleDeleteLocale(locale: Locale) {
    setLoading(true)

    await deleteLocale(locale.id)
      .then(() => {
        toast.success(`Deleted locale ${locale.displayName} (${locale.id.slice(0, 8)}).`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to delete locale. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingLocale(null)
      })
  }

  return (
    <div>
      <div className="relative mb-2 flex w-full max-w-md items-center">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className="pl-10"
          placeholder="Search locales by name or ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 text-center">ID</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-center">Flag</TableHead>
              <TableHead className="text-center">
                <HoverCard openDelay={10} closeDelay={10}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost">Enabled</Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Indicates whether the locale can be selected by users in their projects.
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentLocales.length > 0 ? (
              currentLocales.map((locale) => {
                return (
                  <TableRow key={locale.id}>
                    <TableCell className="text-center">
                      {locale.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">{locale.displayName}</TableCell>

                    <TableCell className="min-w-32">{locale.language}</TableCell>
                    <TableCell className="min-w-32">{locale.region}</TableCell>

                    <TableCell className="min-w-32">
                      <Badge variant="outline">
                        {locale.code}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-16 text-center">
                      {locale.flag ?? "None"}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {locale.enabled ? (
                          <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {canUpdateLocales ? (
                          <Sheet
                            open={editingLocale !== null}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingLocale(null)
                              }
                            }}
                          >
                            <SheetTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="inline-flex items-center p-1 text-sm"
                                disabled={loading}
                                onClick={() => openEditor(locale)}
                              >
                                <PencilIcon size={16} />
                              </Button>
                            </SheetTrigger>

                            <SheetContent className="flex flex-col overflow-hidden">
                              <form
                                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                                onSubmit={handleUpdateLocale}
                              >
                                <SheetHeader className="shrink-0">
                                  <SheetTitle>
                                    Edit{" "}
                                    <span className="font-mono">
                                      {editingLocale?.displayName} ({editingLocale?.id.slice(0, 8)})
                                    </span>{" "}
                                  </SheetTitle>
                                  <SheetDescription>
                                    Here you can edit the locale&rsquo;s details.
                                  </SheetDescription>
                                </SheetHeader>

                                <ScrollArea className="min-h-0 flex-1 overflow-hidden">
                                  <div className="grid auto-rows-min gap-6 px-4 py-4">
                                    <div className="grid gap-3">
                                      <Label htmlFor="localeName">Display Name</Label>
                                      <Input
                                        id="localeName"
                                        value={displayName}
                                        required
                                        disabled={loading}
                                        onChange={(event) =>
                                          setDisplayName(event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="localeLanguage">Language</Label>
                                      <Input
                                        id="language"
                                        value={language}
                                        required
                                        disabled={loading}
                                        onChange={(event) =>
                                          setLanguage(event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="localeRegion">Region (optional)</Label>
                                      <Input
                                        id="region"
                                        value={region}
                                        disabled={loading}
                                        onChange={(event) =>
                                          setRegion(event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="localeCode">Locale Code</Label>
                                      <Input
                                        id="localeCode"
                                        value={code}
                                        required
                                        disabled={loading}
                                        onChange={(event) =>
                                          setCode(event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="flag">Flag</Label>
                                      <Input
                                        id="flag"
                                        value={flag ?? ""}
                                        disabled={loading}
                                        onChange={(event) =>
                                          setFlag(event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="enabled">
                                        Enabled
                                      </Label>
                                      <ToggleGroup
                                        type="single"
                                        className="grid w-full grid-cols-2 border-2"
                                        value={enabled ? "true" : "false"}
                                        disabled={loading}
                                        onValueChange={(value) => {
                                          if (
                                            value === "true" ||
                                            value === "false"
                                          ) {
                                            setEnabled(value === "true")
                                          }
                                        }}
                                      >
                                        <ToggleGroupItem
                                          value="true"
                                          className="w-full data-[state=on]:bg-emerald-400! data-[state=on]:text-white!"
                                        >
                                          Yes
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                          value="false"
                                          className="w-full data-[state=on]:bg-red-400! data-[state=on]:text-white!"
                                        >
                                          No
                                        </ToggleGroupItem>
                                      </ToggleGroup>
                                    </div>
                                  </div>
                                </ScrollArea>

                                <SheetFooter className="shrink-0">
                                  <Button
                                    type="submit"
                                    disabled={
                                      loading ||
                                      !editingLocale ||
                                      !displayName ||
                                      !language ||
                                      !code
                                    }
                                  >
                                    {loading ? (
                                      <>
                                        <Spinner className="h-4 w-4" />
                                        Saving changes...
                                      </>
                                    ) : (
                                      "Save changes"
                                    )}
                                  </Button>
                                  <SheetClose asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      disabled={loading}
                                    >
                                      Close
                                    </Button>
                                  </SheetClose>
                                </SheetFooter>
                              </form>
                            </SheetContent>
                          </Sheet>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              className="cursor-not-allowed"
                            >
                              <span className="inline-block">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="inline-flex items-center p-1 text-sm"
                                  disabled
                                >
                                  <PencilIcon size={16} />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              You don&rsquo;t have permission to edit locales.
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {canDeleteLocales ? (
                          <AlertDialog
                            open={deletingLocale !== null}
                            onOpenChange={(open) => {
                              if (!open) {
                                setDeletingLocale(null)
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="inline-flex items-center p-1 text-sm"
                                disabled={loading}
                                onClick={() => setDeletingLocale(locale)}
                              >
                                <TrashIcon size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  locale{" "}
                                  <span className="font-mono">
                                    {deletingLocale?.displayName} ({deletingLocale?.id.slice(0, 8)})
                                  </span>{" "}
                                  and all associated translations in all projects. Please confirm
                                  that you want to proceed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <Button
                                  variant="outline"
                                  disabled={loading}
                                  onClick={() => setDeletingLocale(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  disabled={loading || deletingLocale === null}
                                  onClick={(event) => {
                                    event.preventDefault()
                                    if (!deletingLocale) {
                                      return
                                    }

                                    void handleDeleteLocale(deletingLocale)
                                  }}
                                >
                                  {loading ? (
                                    <>
                                      <Spinner className="h-4 w-4" />
                                      Deleting locale...
                                    </>
                                  ) : (
                                    <>
                                      <TrashIcon className="h-4 w-4" />
                                      Delete Locale
                                    </>
                                  )}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              className="cursor-not-allowed"
                            >
                              <span className="inline-block">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="inline-flex items-center p-1 text-sm"
                                  disabled
                                >
                                  <TrashIcon size={16} />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              You don&rsquo;t have permission to delete locales.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No locales found matching your search."
                    : "No locales found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 flex items-center justify-between px-2 text-sm text-muted-foreground">
        <div>
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center gap-4">
          <Pagination aria-label="Pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(event) => {
                    event.preventDefault()
                    if (currentPage > 1) setPage(currentPage - 1)
                  }}
                  className={
                    currentPage === 1
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <div className="text-sm text-muted-foreground">
                Showing {displayStartIndex}-{endIndex} of {total}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={(event) => {
                    event.preventDefault()
                    if (currentPage < totalPages) setPage(currentPage + 1)
                  }}
                  className={
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
