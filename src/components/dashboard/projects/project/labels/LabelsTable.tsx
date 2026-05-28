"use client"

import { deleteProjectLabel, updateProjectLabel } from "@/actions/projects"
import TablePagination from "@/components/dashboard/table-pagination"
import ColorPickerField from "@/components/dashboard/projects/project/shared/ColorPickerField"
import IconPickerField from "@/components/dashboard/projects/project/shared/IconPickerField"
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
import { Input } from "@/components/ui/input"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectLabel } from "@prisma/client"
import { PencilIcon, SearchIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function LabelsTable({
  projectId,
  labels,
  canManageLabels,
}: {
  projectId: string
  labels: ProjectLabel[]
  canManageLabels: boolean
}) {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredLabels = normalizedSearchQuery
    ? labels.filter(
        (label) =>
          (label.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (label.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : labels

  const total = filteredLabels.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentLabels = filteredLabels.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search labels by name or ID..."
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
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Color</TableHead>
              <TableHead className="text-center">Icon</TableHead>
              <TableHead className="max-w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentLabels.length > 0 ? (
              currentLabels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell className="text-center">
                    {label.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{label.name}</TableCell>

                  <TableCell>
                    {label.description ? (
                      <span className="line-clamp-2">{label.description}</span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !label.color && "text-muted-foreground italic"
                    )}
                  >
                    {label.color ? (
                      <>
                        <Badge
                          variant="outline"
                          style={getColorStyle(label.color)}
                          className={getColorClassName(label.color)}
                        >
                          {label.name}
                        </Badge>
                        <p className="sr-only">{label.color}</p>
                      </>
                    ) : (
                      <p>No color specified</p>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !label.icon && "text-muted-foreground italic"
                    )}
                  >
                    {label.icon ? (
                      (() => {
                        const LabelIcon = getIcon(label.icon)
                        return LabelIcon ? (
                          <LabelIcon
                            className="mx-auto h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <p>Invalid icon</p>
                        )
                      })()
                    ) : (
                      <p>No icon specified</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <EditLabelSheet
                        projectId={projectId}
                        label={label}
                        canUpdateLabels={canManageLabels}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteLabelDialog
                        projectId={projectId}
                        label={label}
                        canDeleteLabels={canManageLabels}
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
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No labels found matching your search."
                    : "No labels found."}
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

function EditLabelSheet({
  projectId,
  label,
  canUpdateLabels,
  loading,
  setLoading,
}: {
  projectId: string
  label: ProjectLabel
  canUpdateLabels: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const [editingLabel, setEditingLabel] = useState<ProjectLabel | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState<string | null>(null)
  const [color, setColor] = useState("#FFFFFF")
  const [icon, setIcon] = useState("")

  function openEditor(currentLabel: ProjectLabel) {
    setName(currentLabel.name ?? "")
    setDescription(currentLabel.description ?? null)
    setColor((currentLabel.color ?? "#FFFFFF").toUpperCase())
    setIcon(currentLabel.icon ?? "")
    setEditingLabel(currentLabel)
  }

  function closeEditor() {
    setEditingLabel(null)
    setName("")
    setDescription(null)
    setColor("#FFFFFF")
    setIcon("")
  }

  async function handleUpdateLabel(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingLabel) return
    setLoading(true)

    await updateProjectLabel({
      projectId,
      labelId: editingLabel.id,
      name: name.trim(),
      description: description?.trim() || null,
      color,
      icon,
    })
      .then((updatedLabel) => {
        toast.success(`Updated label ${updatedLabel.name}.`)
        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update label. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet
      open={editingLabel?.id === label.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateLabels || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateLabels || loading}
                onClick={() => openEditor(label)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateLabels && (
          <TooltipContent>
            You don&rsquo;t have permission to edit labels.
          </TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateLabel}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              Edit{" "}
              <span className="font-mono">
                {editingLabel?.name} ({editingLabel?.id.slice(0, 8)})
              </span>
            </SheetTitle>
            <SheetDescription>
              Here you can edit the label&rsquo;s details.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="labelName">Name</Label>
                <Input
                  id="labelName"
                  value={name}
                  required
                  disabled={loading}
                  onChange={({ target: { value } }) => setName(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="labelDescription">Description (optional)</Label>
                <Input
                  id="labelDescription"
                  value={description || ""}
                  disabled={loading}
                  onChange={({ target: { value } }) => setDescription(value)}
                />
              </div>

              <ColorPickerField
                id="labelColor"
                label="Color"
                value={color}
                onChange={setColor}
                disabled={loading}
              />

              <IconPickerField
                id="labelIcon"
                label="Icon (optional)"
                value={icon}
                onChange={setIcon}
                disabled={loading}
              />
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={loading || !editingLabel || !name.trim()}
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

function DeleteLabelDialog({
  projectId,
  label,
  canDeleteLabels,
  loading,
  setLoading,
}: {
  projectId: string
  label: ProjectLabel
  canDeleteLabels: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const [deletingLabel, setDeletingLabel] = useState<ProjectLabel | null>(null)

  async function handleDeleteLabel(currentLabel: ProjectLabel) {
    setLoading(true)

    await deleteProjectLabel({
      projectId,
      labelId: currentLabel.id,
    })
      .then((deletedLabel) => {
        toast.success(`Deleted label ${deletedLabel.name}.`)
        setDeletingLabel(null)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to delete label. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AlertDialog
      open={!!deletingLabel}
      onOpenChange={(open) => !open && setDeletingLabel(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteLabels || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteLabels || loading}
                onClick={() => setDeletingLabel(label)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteLabels && (
          <TooltipContent>
            You don&rsquo;t have permission to delete labels.
          </TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete label?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              label{" "}
              <span className="font-mono">
                {deletingLabel?.name} ({deletingLabel?.id.slice(0, 8)})
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingLabel(null)}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingLabel === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingLabel) return
                void handleDeleteLabel(deletingLabel)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Deleting label...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Delete Label
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
