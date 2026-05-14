"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { auth } from "@/lib/auth"
import { authClient, useSession } from "@/lib/auth-client"
import {
  PencilIcon,
  ScanFaceIcon,
  TrashIcon,
  UserCogIcon,
  UserIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function UsersTable({
  session,
  users,
}: {
  session: ReturnType<typeof useSession>["data"]
  users: Awaited<ReturnType<typeof auth.api.listUsers>>
}) {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const total = users.total
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = Math.min(total, page * PAGE_SIZE)
  const currentUsers = users.users.slice(startIndex, endIndex)

  function handleImpersonateUser({
    user,
  }: {
    user: (typeof users.users)[number]
  }) {
    setLoading(true)
    authClient.admin.impersonateUser({
      userId: user.id,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            `Started impersonating ${user.name} (${user.id.slice(0, 8)}).`
          )
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to impersonate user. Please try again."
          )
          setLoading(false)
        },
      },
    })
  }

  function handleDeleteUser({ user }: { user: (typeof users.users)[number] }) {
    setLoading(true)
    authClient.admin.removeUser({
      userId: user.id,
      fetchOptions: {
        onSuccess: () => {
          toast.success(`Deleted user ${user.name} (${user.id.slice(0, 8)}).`)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to delete user. Please try again."
          )
          setLoading(false)
        },
      },
    })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 text-center">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">
                      {user.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">
                      <div className="flex gap-2">
                        <span className="font-mono text-sm">{user.name}</span>
                        {user.id === session?.user.id && <Badge>You</Badge>}
                      </div>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {user.role === "admin" ? (
                          <UserCogIcon className="mr-1 h-4 w-4" />
                        ) : (
                          <UserIcon className="mr-1 h-4 w-4" />
                        )}
                        <span className="font-mono text-sm">
                          {(user.role?.trim().charAt(0).toUpperCase() || "") +
                            user.role?.trim().slice(1) || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="inline-flex items-center p-1 text-sm"
                          disabled={loading}
                        >
                          <PencilIcon size={16} />
                        </Button>
                        {user.id === session?.user.id ? (
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
                                  <ScanFaceIcon size={16} />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              You can&rsquo;t impersonate yourself.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="inline-flex items-center p-1 text-sm"
                            disabled={loading}
                            onClick={(event) => {
                              event.preventDefault()
                              void handleImpersonateUser({ user })
                            }}
                          >
                            <ScanFaceIcon size={16} />
                          </Button>
                        )}
                        {user.id === session?.user.id ? (
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
                              You can&rsquo;t delete your own account.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <AlertDialog
                            open={isDialogOpen}
                            onOpenChange={setDialogOpen}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="inline-flex items-center p-1 text-sm"
                                disabled={loading}
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
                                  permanently delete the user account{" "}
                                  <span className="font-mono">
                                    {user.name} ({user.id.slice(0, 8)})
                                  </span>{" "}
                                  and all associated data. Please confirm that
                                  you want to proceed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <Button
                                  variant="outline"
                                  disabled={loading}
                                  onClick={() => setDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  disabled={loading}
                                  onClick={(event) => {
                                    event.preventDefault()
                                    void handleDeleteUser({ user })
                                  }}
                                >
                                  {loading ? (
                                    <>
                                      <Spinner className="h-4 w-4" />
                                      Deleting user...
                                    </>
                                  ) : (
                                    <>
                                      <TrashIcon className="h-4 w-4" />
                                      Delete User
                                    </>
                                  )}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 flex items-center justify-between px-2 text-sm text-muted-foreground">
        <div>
          Page {page} of {totalPages}
        </div>

        <div className="flex items-center gap-4">
          <Pagination aria-label="Pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(event) => {
                    event.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                  className={
                    page === 1
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {total}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={(event) => {
                    event.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                  className={
                    page === totalPages
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
