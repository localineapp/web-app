"use client"

import { deleteProjectTerm, updateProjectTerm } from "@/actions/project-terms"
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
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ProjectTerm } from "@prisma/client"
import {
  LockIcon,
  LockOpenIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function TermsTable({
  terms,
  canLockTerms,
  canUpdateTerms,
  canDeleteTerms,
}: {
  terms: ProjectTerm[]
  canLockTerms: boolean
  canUpdateTerms: boolean
  canDeleteTerms: boolean
}) {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredTerms = normalizedSearchQuery
    ? terms.filter(
        (term) =>
          (term.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (term.key ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (term.context ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : terms

  const total = filteredTerms.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentTerms = filteredTerms.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  async function handleUpdateLockTerm(term: ProjectTerm) {
    setLoading(true)

    await updateProjectTerm({
      projectId: term.projectId,
      termId: term.id,
      locked: !term.locked,
    })
      .then(() => {
        toast.success(
          `${term.locked ? "Unlocked" : "Locked"} term ${term.key} (${term.id.slice(0, 8)}).`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            "Failed to update term lock status. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search terms by ID, key, or context..."
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
              <TableHead>Key</TableHead>
              <TableHead>Context</TableHead>
              <TableHead className="text-center">
                <HoverCard openDelay={10} closeDelay={10}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost">Locked</Button>
                  </HoverCardTrigger>

                  <HoverCardContent>
                    In order to translate locked terms, the editor must have the{" "}
                    <strong>TRANSLATE_LOCKED</strong> permission.
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
              <TableHead className="max-w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentTerms.length > 0 ? (
              currentTerms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="text-center">
                    {term.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{term.key}</TableCell>

                  <TableCell className="min-w-80">
                    {term.context || (
                      <span className="text-muted-foreground italic">None</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer rounded-full p-0"
                          disabled={loading || !canLockTerms}
                          onClick={(event) => {
                            event.preventDefault()
                            handleUpdateLockTerm(term)
                          }}
                        >
                          {term.locked ? (
                            <LockIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                          ) : (
                            <LockOpenIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      {!canLockTerms && (
                        <TooltipContent>
                          You don&rsquo;t have permission to lock or unlock
                          terms.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <EditTermSheet
                        term={term}
                        canUpdateTerms={canUpdateTerms}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteTermDialog
                        term={term}
                        canDeleteTerms={canDeleteTerms}
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

function EditTermSheet({
  term,
  canUpdateTerms,
  loading,
  setLoading,
}: {
  term: ProjectTerm
  canUpdateTerms: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const [editingTerm, setEditingTerm] = useState<ProjectTerm | null>(null)

  const [key, setKey] = useState("")
  const [context, setContext] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  function openEditor(currentTerm: ProjectTerm) {
    setKey(currentTerm.key)
    setContext(currentTerm.context ?? null)
    setLocked(currentTerm.locked)
    setEditingTerm(currentTerm)
  }

  function closeEditor() {
    setEditingTerm(null)
    setKey("")
    setContext(null)
    setLocked(false)
  }

  async function handleUpdateTerm(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingTerm) return
    setLoading(true)

    await updateProjectTerm({
      projectId: editingTerm.projectId,
      termId: editingTerm.id,
      key: key.trim(),
      context: context?.trim() || null,
      locked,
    })
      .then((updatedTerm) => {
        toast.success(`Updated term ${updatedTerm.key}.`)
        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update term. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet
      open={editingTerm?.id === term.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateTerms || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateTerms || loading}
                onClick={() => openEditor(term)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateTerms && (
          <TooltipContent>
            You don&rsquo;t have permission to edit terms.
          </TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateTerm}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              Edit{" "}
              <span className="font-mono">
                {editingTerm?.key} ({editingTerm?.id.slice(0, 8)})
              </span>
            </SheetTitle>
            <SheetDescription>
              Here you can edit the term&rsquo;s details.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="termKey">Key</Label>
                <Input
                  id="termKey"
                  value={key}
                  required
                  disabled={loading}
                  onChange={({ target: { value } }) => setKey(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="termContext">Context (optional)</Label>
                <Input
                  id="termContext"
                  value={context || ""}
                  disabled={loading}
                  onChange={({ target: { value } }) => setContext(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="termLocked">Locked</Label>
                <ToggleGroup
                  type="single"
                  className="grid w-full grid-cols-2 border-2"
                  value={locked ? "true" : "false"}
                  disabled={loading}
                  onValueChange={(value) => {
                    if (value === "true" || value === "false") {
                      setLocked(value === "true")
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
              disabled={loading || !editingTerm || !key.trim()}
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
                variant="outline"
                disabled={loading}
                onClick={closeEditor}
              >
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function DeleteTermDialog({
  term,
  canDeleteTerms,
  loading,
  setLoading,
}: {
  term: ProjectTerm
  canDeleteTerms: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const [deletingTerm, setDeletingTerm] = useState<ProjectTerm | null>(null)

  async function handleDeleteTerm(term: ProjectTerm) {
    setLoading(true)

    await deleteProjectTerm({
      projectId: term.projectId,
      termId: term.id,
    })
      .then(() => {
        toast.success(`Deleted term ${term.key} (${term.id.slice(0, 8)}).`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to delete term. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingTerm(null)
      })
  }

  return (
    <AlertDialog
      open={!!deletingTerm}
      onOpenChange={(open) => !open && setDeletingTerm(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteTerms || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteTerms || loading}
                onClick={() => setDeletingTerm(term)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteTerms && (
          <TooltipContent>
            You don&rsquo;t have permission to delete terms.
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
              term{" "}
              <span className="font-mono">
                {deletingTerm?.key} ({deletingTerm?.id.slice(0, 8)})
              </span>{" "}
              and all associated translations in the projects. Please confirm
              that you want to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingTerm(null)}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingTerm === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingTerm) return

                void handleDeleteTerm(deletingTerm)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Deleting term...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Delete Term
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
