"use client"

import { removeProjectLocale } from "@/actions/project-locales"
import TablePagination from "@/components/dashboard/TablePagination"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getFlag } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectLocaleWithLocale } from "@/types/project"
import { SearchIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function LocalesTable({
  projectLocales,
  canManageLocales,
}: {
  projectLocales: ProjectLocaleWithLocale[]
  canManageLocales: boolean
}) {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjectLocales = normalizedSearchQuery
    ? projectLocales.filter(
        (projectLocale) =>
          (projectLocale.id ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (projectLocale.locale.displayName ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (projectLocale.locale.code ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery)
      )
    : projectLocales

  const total = filteredProjectLocales.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentProjectLocales = filteredProjectLocales.slice(
    startIndex,
    endIndex
  )
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search locales by ID, name, or code..."
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
              <TableHead className="max-w-28 text-center">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-center">Flag</TableHead>
              <TableHead className="max-w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjectLocales.length > 0 ? (
              currentProjectLocales.map((projectLocale) => (
                <TableRow key={projectLocale.id}>
                  <TableCell className="text-center">
                    {projectLocale.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {projectLocale.locale.displayName}
                  </TableCell>

                  <TableCell className="min-w-32">
                    <Badge variant="outline">{projectLocale.locale.code}</Badge>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-24 text-center",
                      !projectLocale.locale.flag &&
                        "text-muted-foreground italic"
                    )}
                  >
                    {projectLocale.locale.flag ? (
                      (() => {
                        const FlagIcon = getFlag(projectLocale.locale.flag)
                        return FlagIcon ? (
                          <FlagIcon
                            className="mx-auto h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <p>Invalid flag</p>
                        )
                      })()
                    ) : (
                      <p>None</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <RemoveLocaleDialog
                        projectLocale={projectLocale}
                        canManageLocales={canManageLocales}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
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

function RemoveLocaleDialog({
  projectLocale,
  canManageLocales,
  loading,
  setLoading,
}: {
  projectLocale: ProjectLocaleWithLocale
  canManageLocales: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const [removingLocale, setRemovingLocale] =
    useState<ProjectLocaleWithLocale | null>(null)

  async function handleRemoveLocale(projectLocale: ProjectLocaleWithLocale) {
    setLoading(true)

    await removeProjectLocale({
      projectId: projectLocale.projectId,
      localeId: projectLocale.id,
    })
      .then(() => {
        toast.success(
          `Removed locale ${projectLocale.locale.displayName} (${projectLocale.id.slice(0, 8)}).`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to delete locale. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setRemovingLocale(null)
      })
  }

  return (
    <AlertDialog
      open={!!removingLocale}
      onOpenChange={(open) => !open && setRemovingLocale(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canManageLocales || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canManageLocales || loading}
                onClick={() => setRemovingLocale(projectLocale)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canManageLocales && (
          <TooltipContent>
            You don&rsquo;t have permission to manage locales.
          </TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              locale{" "}
              <span className="font-mono">
                {removingLocale?.locale.displayName} (
                {removingLocale?.id.slice(0, 8)})
              </span>{" "}
              and all associated translations in the projects. Please confirm
              that you want to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setRemovingLocale(null)}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || removingLocale === null}
              onClick={(event) => {
                event.preventDefault()
                if (!removingLocale) return

                void handleRemoveLocale(removingLocale)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Removing locale...
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
      </AlertDialogPortal>
    </AlertDialog>
  )
}
