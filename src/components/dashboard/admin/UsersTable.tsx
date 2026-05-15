"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
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
import { auth } from "@/lib/auth"
import { authClient, useSession } from "@/lib/auth-client"
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  PencilIcon,
  ScanFaceIcon,
  SearchIcon,
  TrashIcon,
  UserCogIcon,
  UserIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

function toDateTimeLocalValue(value: Date | string | null | undefined) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  return localDate.toISOString().slice(0, 16)
}

export default function UsersTable({
  session,
  users,
}: {
  session: ReturnType<typeof useSession>["data"]
  users: Awaited<ReturnType<typeof auth.api.listUsers>>
}) {
  const router = useRouter()
  type UserRow = (typeof users.users)[number]

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [role, setRole] = useState<"user" | "admin">("user")
  const [banned, setBanned] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banExpires, setBanExpires] = useState("")
  const [projectsLimit, setProjectsLimit] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredUsers = normalizedSearchQuery
    ? users.users.filter((user) =>
        (user.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (user.name ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (user.email ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : users.users

  const total = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentUsers = filteredUsers.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  function getProjectsLimit(user: UserRow) {
    /** @ts-expect-error - projectsLimit is a custom field added to the user object, which is not reflected in this type definition. */
    return user.projectsLimit ?? null
  }

  function openEditor(user: UserRow) {
    setName(user.name ?? "")
    setEmail(user.email ?? "")
    setPassword("")
    setEmailVerified(Boolean(user.emailVerified))
    setRole(user.role === "admin" ? "admin" : "user")
    setBanned(Boolean(user.banned))
    setBanReason(user.banReason ?? "")
    setBanExpires(toDateTimeLocalValue(user.banExpires))
    setProjectsLimit(String(getProjectsLimit(user) ?? ""))
    setEditingUser(user)
  }

  function closeEditor() {
    setEditingUser(null)
    setName("")
    setEmail("")
    setPassword("")
    setEmailVerified(false)
    setRole("user")
    setBanned(false)
    setBanReason("")
    setBanExpires("")
    setProjectsLimit("")
  }

  async function handleUpdateUser(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingUser) return

    const currentUser = editingUser
    const initialName = currentUser.name?.trim() ?? ""
    const initialEmail = currentUser.email?.trim() ?? ""
    const initialEmailVerified = Boolean(currentUser.emailVerified)
    const initialRole = currentUser.role === "admin" ? "admin" : "user"
    const initialBanned = Boolean(currentUser.banned)
    const initialBanReason = (currentUser.banReason ?? "").trim()
    const initialBanExpires = toDateTimeLocalValue(currentUser.banExpires)
    const initialProjectsLimit = getProjectsLimit(currentUser)

    const currentName = name.trim()
    const currentEmail = email.trim()
    const currentPassword = password.trim()
    const currentBanReason = banReason.trim()
    const currentBanExpires = banExpires.trim()
    const currentProjectsLimit = projectsLimit.trim()
    const parsedProjectsLimit = Number(currentProjectsLimit)

    if (!currentName || !currentEmail) {
      toast.error("Name and email are required.")
      return
    }

    if (currentProjectsLimit !== "" && Number.isNaN(parsedProjectsLimit)) {
      toast.error("Projects limit must be a valid number.")
      return
    }

    if (currentProjectsLimit === "" && initialProjectsLimit !== null) {
      toast.error("Projects limit cannot be empty.")
      return
    }

    if (banned && currentBanExpires !== "") {
      const parsedBanExpires = new Date(currentBanExpires)

      if (Number.isNaN(parsedBanExpires.getTime())) {
        toast.error("Ban expiry must be a valid date and time.")
        return
      }

      if (parsedBanExpires.getTime() <= Date.now()) {
        toast.error("Ban expiry must be in the future.")
        return
      }
    }

    const hasChanges =
      currentName !== initialName ||
      currentEmail !== initialEmail ||
      currentPassword !== "" ||
      emailVerified !== initialEmailVerified ||
      role !== initialRole ||
      banned !== initialBanned ||
      (banned &&
        (currentBanReason !== initialBanReason ||
          currentBanExpires !== initialBanExpires)) ||
      parsedProjectsLimit !== initialProjectsLimit

    if (!hasChanges) {
      toast.info("No changes to save.")
      closeEditor()
      return
    }

    setLoading(true)

    try {
      const updateData: Record<string, unknown> = {}

      if (currentName !== initialName) {
        updateData.name = currentName
      }

      if (currentEmail !== initialEmail) {
        updateData.email = currentEmail
      }

      if (emailVerified !== initialEmailVerified) {
        updateData.emailVerified = emailVerified
      }

      if (parsedProjectsLimit !== initialProjectsLimit) {
        updateData.projectsLimit = parsedProjectsLimit
      }

      if (Object.keys(updateData).length > 0) {
        const updateResult = await authClient.admin.updateUser({
          userId: currentUser.id,
          data: updateData,
        })

        if (updateResult.error) {
          throw new Error(
            updateResult.error.message ||
            "Failed to update user. Please try again."
          )
        }
      }

      if (role !== initialRole) {
        const roleResult = await authClient.admin.setRole({
          userId: currentUser.id,
          role,
        })

        if (roleResult.error) {
          throw new Error(
            roleResult.error.message ||
            "Failed to update user role. Please try again."
          )
        }
      }

      if (currentPassword !== "") {
        const passwordResult = await authClient.admin.setUserPassword({
          userId: currentUser.id,
          newPassword: currentPassword,
        })

        if (passwordResult.error) {
          throw new Error(
            passwordResult.error.message ||
            "Failed to update user password. Please try again."
          )
        }
      }

      if (
        banned !== initialBanned ||
        (banned &&
          (currentBanReason !== initialBanReason ||
            currentBanExpires !== initialBanExpires))
      ) {
        if (banned) {
          const banExpiresIn =
            currentBanExpires === ""
              ? undefined
              : Math.ceil(
                (new Date(currentBanExpires).getTime() - Date.now()) / 1000
              )

          const banResult = await authClient.admin.banUser({
            userId: currentUser.id,
            banReason: currentBanReason || undefined,
            banExpiresIn,
          })

          if (banResult.error) {
            throw new Error(
              banResult.error.message ||
              "Failed to update user ban status. Please try again."
            )
          }
        } else {
          const unbanResult = await authClient.admin.unbanUser({
            userId: currentUser.id,
          })

          if (unbanResult.error) {
            throw new Error(
              unbanResult.error.message ||
              "Failed to update user ban status. Please try again."
            )
          }
        }
      }

      toast.success(`Updated ${currentName} (${currentUser.id.slice(0, 8)}).`)
      closeEditor()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update user. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

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
          router.push("/")
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
          setLoading(false)
          setDialogOpen(false)
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to delete user. Please try again."
          )
          setLoading(false)
          setDialogOpen(false)
        },
      },
    })
  }

  return (
    <div>
      <div className="relative flex w-full max-w-md items-center mb-2">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className="pl-10"
          placeholder="Search users by name, email, or ID..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Banned</TableHead>
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

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{user.email}</span>
                        {user.emailVerified ? (
                          <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {user.role === "admin" ? (
                          <UserCogIcon className="mr-1 size-4" />
                        ) : (
                          <UserIcon className="mr-1 size-4" />
                        )}
                        <span className="font-mono text-sm">
                          {(user.role?.trim().charAt(0).toUpperCase() || "") +
                            user.role?.trim().slice(1) || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center">
                        {user.banned ? (
                          <BadgeCheckIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                        ) : (
                          <BadgeXIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Sheet
                          open={editingUser?.id === user.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              closeEditor()
                            }
                          }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="inline-flex items-center p-1 text-sm"
                            disabled={loading}
                            onClick={() => openEditor(user)}
                          >
                            <PencilIcon size={16} />
                          </Button>

                          <SheetContent className="flex flex-col overflow-hidden">
                            <form
                              className="flex min-h-0 flex-1 flex-col overflow-hidden"
                              onSubmit={handleUpdateUser}
                            >
                              <SheetHeader className="shrink-0">
                                <SheetTitle>
                                  Edit{" "}
                                  <span className="font-mono">
                                    {editingUser?.name ?? user.name} (
                                    {editingUser?.id.slice(0, 8) ??
                                      user.id.slice(0, 8)}
                                    )
                                  </span>{" "}
                                </SheetTitle>
                                <SheetDescription>
                                  Here you can edit the user&rsquo;s
                                  details, change their role, or ban/unban
                                  the user. Please note that you cannot edit
                                  your own account from here.
                                </SheetDescription>
                                {session?.user.id === editingUser?.id && (
                                  <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50 mt-2">
                                    <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
                                    <AlertTitle>
                                      Editing Own Profile
                                    </AlertTitle>
                                    <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
                                      You are currently editing your own
                                      profile. Changes you make here may
                                      lock you out of your account or cause
                                      other issues. Please be careful!
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </SheetHeader>

                              <ScrollArea className="min-h-0 flex-1 overflow-hidden">
                                <div className="grid auto-rows-min gap-6 px-4 py-4">
                                  <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                      id="name"
                                      value={name}
                                      required
                                      disabled={loading}
                                      onChange={(event) =>
                                        setName(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                      id="email"
                                      value={email}
                                      required
                                      disabled={loading}
                                      onChange={(event) =>
                                        setEmail(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                      id="password"
                                      type="password"
                                      value={password}
                                      placeholder="Leave blank to keep the current password"
                                      disabled={loading}
                                      onChange={(event) =>
                                        setPassword(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="emailVerified">
                                      Email Verified
                                    </Label>
                                    <ToggleGroup
                                      type="single"
                                      className="grid w-full grid-cols-2 border-2"
                                      value={emailVerified ? "true" : "false"}
                                      disabled={loading}
                                      onValueChange={(value) => {
                                        if (
                                          value === "true" ||
                                          value === "false"
                                        ) {
                                          setEmailVerified(value === "true")
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
                                  <div className="grid gap-3">
                                    <Label htmlFor="role">Role</Label>
                                    <NativeSelect
                                      id="role"
                                      value={role}
                                      required
                                      disabled={loading}
                                      onChange={(event) =>
                                        setRole(
                                          event.target.value === "admin"
                                            ? "admin"
                                            : "user"
                                        )
                                      }
                                    >
                                      <NativeSelectOption value="user">
                                        User
                                      </NativeSelectOption>
                                      <NativeSelectOption value="admin">
                                        Admin
                                      </NativeSelectOption>
                                    </NativeSelect>
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="banned">Banned</Label>
                                    <ToggleGroup
                                      type="single"
                                      className="grid w-full grid-cols-2 border-2"
                                      value={banned ? "true" : "false"}
                                      disabled={loading}
                                      onValueChange={(value) => {
                                        if (
                                          value === "true" ||
                                          value === "false"
                                        ) {
                                          setBanned(value === "true")
                                        }
                                      }}
                                    >
                                      <ToggleGroupItem
                                        value="true"
                                        className="w-full data-[state=on]:bg-red-400! data-[state=on]:text-white!"
                                      >
                                        Yes
                                      </ToggleGroupItem>
                                      <ToggleGroupItem
                                        value="false"
                                        className="w-full data-[state=on]:bg-emerald-400! data-[state=on]:text-white!"
                                      >
                                        No
                                      </ToggleGroupItem>
                                    </ToggleGroup>
                                  </div>
                                  {banned && (
                                    <>
                                      <div className="grid gap-3">
                                        <Label htmlFor="banReason">
                                          Ban Reason
                                        </Label>
                                        <Input
                                          id="banReason"
                                          value={banReason}
                                          placeholder="Enter ban reason..."
                                          disabled={loading}
                                          onChange={(event) =>
                                            setBanReason(event.target.value)
                                          }
                                        />
                                      </div>
                                      <div className="grid gap-3">
                                        <Label htmlFor="banExpires">
                                          Ban Expires
                                        </Label>
                                        <Input
                                          id="banExpires"
                                          type="datetime-local"
                                          value={banExpires}
                                          disabled={loading}
                                          onChange={(event) =>
                                            setBanExpires(event.target.value)
                                          }
                                        />
                                      </div>
                                    </>
                                  )}
                                  <div className="grid gap-3">
                                    <Label htmlFor="projectsLimit">
                                      Projects Limit
                                    </Label>
                                    <Input
                                      id="projectsLimit"
                                      type="number"
                                      value={projectsLimit}
                                      placeholder="Enter projects limit..."
                                      disabled={loading}
                                      onChange={(event) =>
                                        setProjectsLimit(event.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </ScrollArea>

                              <SheetFooter className="shrink-0">
                                <Button
                                  type="submit"
                                  disabled={
                                    loading ||
                                    !editingUser ||
                                    !name.trim() ||
                                    !email.trim()
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
                        {user.id === session?.user.id || user.banned ? (
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
                              {user.id === session?.user.id
                                ? "You can't impersonate yourself."
                                : "You can't impersonate a banned user."}
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
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No users found matching your search."
                    : "No users found."}
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
