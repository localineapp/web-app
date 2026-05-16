"use client"

import { deletePlan, updateDefaultPlan, updatePlan } from "@/actions/plans"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Plan } from "@prisma/client"
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"
import CreatePlanDialog from "@/components/dashboard/admin/plans/CreatePlanDialog"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const PAGE_SIZE = 10

export default function PlansTable({
  plans,
  canCreatePlans,
  canUpdatePlans,
  canDeletePlans,
  existsDefaultPlan,
}: {
  plans: Plan[]
  canCreatePlans: boolean
  canUpdatePlans: boolean
  canDeletePlans: boolean
  existsDefaultPlan: boolean
}) {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState<string | null>(null)
  const [localesLimit, setLocalesLimit] = useState<number | null>(null)
  const [termsLimit, setTermsLimit] = useState<number | null>(null)
  const [labelsLimit, setLabelsLimit] = useState<number | null>(null)
  const [membersLimit, setMembersLimit] = useState<number | null>(null)

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredPlans = normalizedSearchQuery
    ? plans.filter(
      (plan) =>
        (plan.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (plan.displayName ?? "")
          .toLowerCase()
          .includes(normalizedSearchQuery) ||
        (plan.description ?? "").toLowerCase().includes(normalizedSearchQuery)
    )
    : plans

  const total = filteredPlans.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentPlans = filteredPlans.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  function openEditor(plan: Plan) {
    setDisplayName(plan.displayName ?? "")
    setDescription(plan.description)
    setLocalesLimit(plan.localesLimit)
    setTermsLimit(plan.termsLimit)
    setLabelsLimit(plan.labelsLimit)
    setMembersLimit(plan.membersLimit)
    setEditingPlan(plan)
  }

  async function handleUpdateDefaultPlan(plan: Plan) {
    if (plan.default) {
      toast.error(`Plan ${plan.displayName} (${plan.id.slice(0, 8)}) is already the default plan.`)
      return
    }

    setLoading(true)

    await updateDefaultPlan(plan.id)
      .then(() => {
        toast.success(
          `Set plan ${plan.displayName} (${plan.id.slice(0, 8)}) as default.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update default plan. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  async function handleUpdatePlan(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingPlan) return

    setLoading(true)
    await updatePlan(editingPlan.id, {
      displayName,
      description: description || null,
      localesLimit: localesLimit || null,
      termsLimit: termsLimit || null,
      labelsLimit: labelsLimit || null,
      membersLimit: membersLimit || null,
    })
      .then(() => {
        toast.success(
          `Updated plan ${displayName} (${editingPlan.id.slice(0, 8)}).`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update plan. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setEditingPlan(null)
      })
  }

  async function handleDeletePlan(plan: Plan) {
    setLoading(true)

    await deletePlan(plan.id)
      .then(() => {
        toast.success(
          `Deleted plan ${plan.displayName} (${plan.id.slice(0, 8)}).`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to delete plan. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingPlan(null)
      })
  }

  if (total === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>
          <EmptyTitle>No Plans Yet</EmptyTitle>
          <EmptyDescription>
            There have been no plans created yet.
          </EmptyDescription>
          <EmptyDescription>
            <CreatePlanDialog canCreatePlans={canCreatePlans} />
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div>
      {!existsDefaultPlan && (
        <Alert className="mt-2 mb-2 max-w-xl border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
          <AlertTitle>No Default Plan</AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            There is currently no default plan set. This means that new projects can&rsquo;t be created because every project must be associated with a plan.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative mb-2 flex w-full max-w-md items-center">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className="pl-10"
          placeholder="Search plans by name or ID..."
          value={searchQuery}
          onChange={({ target: { value } }) => {
            setSearchQuery(value)
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
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Default</TableHead>
              <TableHead className="text-center">Locales</TableHead>
              <TableHead className="text-center">Terms</TableHead>
              <TableHead className="text-center">Labels</TableHead>
              <TableHead className="text-center">Members</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentPlans.length > 0 ? (
              currentPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="text-center">
                    {plan.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{plan.displayName}</TableCell>

                  <TableCell
                    className={cn(
                      "min-w-32",
                      !plan.description && "text-muted-foreground italic"
                    )}
                  >
                    {plan.description ?? "None"}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-default rounded-full p-0"
                      disabled={loading}
                      onClick={(event) => {
                        event.preventDefault()
                        handleUpdateDefaultPlan(plan)
                      }}
                    >
                      {plan.default ? (
                        <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.localesLimit
                      ? plan.localesLimit.toLocaleString("en-US")
                      : "∞"}
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.termsLimit
                      ? plan.termsLimit.toLocaleString("en-US")
                      : "∞"}
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.labelsLimit
                      ? plan.labelsLimit.toLocaleString("en-US")
                      : "∞"}
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.membersLimit
                      ? plan.membersLimit.toLocaleString("en-US")
                      : "∞"}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {canUpdatePlans ? (
                        <Sheet
                          open={editingPlan !== null}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingPlan(null)
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
                              onClick={() => openEditor(plan)}
                            >
                              <PencilIcon size={16} />
                            </Button>
                          </SheetTrigger>

                          <SheetContent className="flex flex-col overflow-hidden">
                            <form
                              className="flex min-h-0 flex-1 flex-col overflow-hidden"
                              onSubmit={handleUpdatePlan}
                            >
                              <SheetHeader className="shrink-0">
                                <SheetTitle>
                                  Edit{" "}
                                  <span className="font-mono">
                                    {editingPlan?.displayName} (
                                    {editingPlan?.id.slice(0, 8)})
                                  </span>{" "}
                                </SheetTitle>
                                <SheetDescription>
                                  Here you can edit the plan&rsquo;s details.
                                </SheetDescription>
                              </SheetHeader>

                              <ScrollArea className="min-h-0 flex-1 overflow-hidden">
                                <div className="grid auto-rows-min gap-6 px-4 py-4">
                                  <div className="grid gap-3">
                                    <Label htmlFor="planName">
                                      Display Name
                                    </Label>
                                    <Input
                                      id="planName"
                                      value={displayName}
                                      required
                                      disabled={loading}
                                      onChange={(event) =>
                                        setDisplayName(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="planDescription">
                                      Description (optional)
                                    </Label>
                                    <Input
                                      id="planDescription"
                                      value={description || ""}
                                      disabled={loading}
                                      onChange={(event) =>
                                        setDescription(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="planLocalesLimit">
                                      Locales Limit (Empty for unlimited)
                                    </Label>
                                    <Input
                                      id="planLocalesLimit"
                                      type="number"
                                      value={localesLimit ?? ""}
                                      placeholder="Enter locales limit..."
                                      disabled={loading}
                                      onChange={(event) =>
                                        setLocalesLimit(
                                          event.target.value
                                            ? Number(event.target.value)
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="planTermsLimit">
                                      Terms Limit (Empty for unlimited)
                                    </Label>
                                    <Input
                                      id="planTermsLimit"
                                      type="number"
                                      value={termsLimit ?? ""}
                                      placeholder="Enter terms limit..."
                                      disabled={loading}
                                      onChange={(event) =>
                                        setTermsLimit(
                                          event.target.value
                                            ? Number(event.target.value)
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="planLabelsLimit">
                                      Labels Limit (Empty for unlimited)
                                    </Label>
                                    <Input
                                      id="planLabelsLimit"
                                      type="number"
                                      value={labelsLimit ?? ""}
                                      placeholder="Enter labels limit..."
                                      disabled={loading}
                                      onChange={(event) =>
                                        setLabelsLimit(
                                          event.target.value
                                            ? Number(event.target.value)
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="planMembersLimit">
                                      Members Limit (Empty for unlimited)
                                    </Label>
                                    <Input
                                      id="planMembersLimit"
                                      type="number"
                                      value={membersLimit ?? ""}
                                      placeholder="Enter members limit..."
                                      disabled={loading}
                                      onChange={(event) =>
                                        setMembersLimit(
                                          event.target.value
                                            ? Number(event.target.value)
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </ScrollArea>

                              <SheetFooter className="shrink-0">
                                <Button
                                  type="submit"
                                  disabled={
                                    loading || !editingPlan || !displayName
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
                            You don&rsquo;t have permission to edit plans.
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {canDeletePlans ? (
                        <AlertDialog
                          open={deletingPlan !== null}
                          onOpenChange={(open) => {
                            if (!open) {
                              setDeletingPlan(null)
                            }
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="inline-flex items-center p-1 text-sm"
                              disabled={loading}
                              onClick={() => setDeletingPlan(plan)}
                            >
                              <TrashIcon size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the plan{" "}
                                <span className="font-mono">
                                  {deletingPlan?.displayName} (
                                  {deletingPlan?.id.slice(0, 8)})
                                </span>{" "}
                                and all associated translations in all projects.
                                Please confirm that you want to proceed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <Button
                                variant="outline"
                                disabled={loading}
                                onClick={() => setDeletingPlan(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                disabled={loading || deletingPlan === null}
                                onClick={(event) => {
                                  event.preventDefault()
                                  if (!deletingPlan) {
                                    return
                                  }

                                  void handleDeletePlan(deletingPlan)
                                }}
                              >
                                {loading ? (
                                  <>
                                    <Spinner className="h-4 w-4" />
                                    Deleting plan...
                                  </>
                                ) : (
                                  <>
                                    <TrashIcon className="h-4 w-4" />
                                    Delete Plan
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
                            You don&rsquo;t have permission to delete this plan.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No plans found matching your search."
                    : "No plans found."}
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
          <Pagination>
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
