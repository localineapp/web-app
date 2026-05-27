"use client"

import TablePagination from "@/components/dashboard/table-pagination"
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
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card"
import { HoverCardContent } from "@/components/ui/hover-card"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getPermissions } from "@/lib/project-permissions"
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { Project, ProjectMemberRole } from "@prisma/client"
import { PencilIcon, SearchIcon, StarIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"

const PAGE_SIZE = 10

export default function MemberRolesTable({
  project,
  memberRoles,
  canManageRoles,
}: {
  project: Project
  memberRoles: ProjectMemberRole[]
  canManageRoles: boolean
}) {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredMemberRoles = normalizedSearchQuery
    ? memberRoles.filter(
        (role) =>
          (role.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (role.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : memberRoles

  const total = filteredMemberRoles.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentRoles = filteredMemberRoles.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search roles by name or ID..."
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
              <TableHead className="text-center">Color</TableHead>
              <TableHead className="text-center">Icon</TableHead>
              <TableHead className="max-w-32 text-center">
                Permissions
              </TableHead>
              <TableHead className="max-w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentRoles.length > 0 ? (
              currentRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="text-center">
                    {role.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {role.name}
                    {role.id === project.id && (
                      <HoverCard openDelay={10} closeDelay={10}>
                        <HoverCardTrigger asChild>
                          <StarIcon className="ml-2 inline h-4 w-4 cursor-pointer text-yellow-500 hover:opacity-80" />
                        </HoverCardTrigger>
                        <HoverCardContent>
                          This is the Owner role, which is automatically
                          assigned to the project creator and has all
                          permissions by default.
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !role.color && "text-muted-foreground italic"
                    )}
                  >
                    {role.color ? (
                      <>
                        <Badge
                          variant="outline"
                          style={getColorStyle(role.color)}
                          className={getColorClassName(role.color)}
                        >
                          {role.name}
                        </Badge>
                        <p className="sr-only">{role.color}</p>
                      </>
                    ) : (
                      <p>No color specified</p>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !role.icon && "text-muted-foreground italic"
                    )}
                  >
                    {role.icon ? (
                      (() => {
                        const RoleIcon = getIcon(role.icon)
                        return RoleIcon ? (
                          <RoleIcon
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

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      role.permissions === BigInt(0) &&
                        "text-muted-foreground italic"
                    )}
                  >
                    {role.permissions === BigInt(0) ? (
                      <p>No permissions</p>
                    ) : (
                      <>{getPermissions(role.permissions).length}</>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <EditMemberRoleSheet
                        role={role}
                        canUpdateRoles={canManageRoles}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteMemberRoleDialog
                        role={role}
                        canDeleteRoles={canManageRoles}
                        isOwnerRole={role.id === project.id}
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
                    ? "No roles found matching your search."
                    : "No roles found."}
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

function EditMemberRoleSheet({
  role,
  canUpdateRoles,
  loading,
  setLoading,
}: {
  role: ProjectMemberRole
  canUpdateRoles: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const [editingRole, setEditingRole] = useState<ProjectMemberRole | null>(null)

  const [name, setName] = useState("")
  const [color, setColor] = useState<string | null>(null)
  const [icon, setIcon] = useState<string | null>(null)

  function openEditor(role: ProjectMemberRole) {
    setName(role.name ?? "")
    setColor(role.color)
    setIcon(role.icon)
    setEditingRole(role)
  }

  function closeEditor() {
    setEditingRole(null)
    setName("")
    setColor(null)
    setIcon(null)
  }

  async function handleUpdateRole(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingRole) return

    setLoading(true)
  }

  return (
    <Sheet
      open={editingRole?.id === role.id}
      onOpenChange={(open) => {
        if (!open) {
          closeEditor()
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateRoles || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateRoles || loading}
                onClick={() => openEditor(role)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateRoles && (
          <TooltipContent>
            You don&rsquo;t have permission to edit roles.
          </TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateRole}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              Edit{" "}
              <span className="font-mono">
                {editingRole?.name} ({editingRole?.id.slice(0, 8)})
              </span>{" "}
            </SheetTitle>
            <SheetDescription>
              Here you can edit the role&rsquo;s name, color, and icon.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="roleName">Name</Label>
                <Input
                  id="roleName"
                  value={name}
                  required
                  disabled={loading}
                  onChange={({ target: { value } }) => setName(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="roleColor">Color (optional)</Label>
                <Input
                  id="roleColor"
                  value={color || ""}
                  disabled={loading}
                  onChange={({ target: { value } }) => setColor(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="roleIcon">Icon (optional)</Label>
                <Input
                  id="roleIcon"
                  value={icon || ""}
                  disabled={loading}
                  onChange={({ target: { value } }) => setIcon(value)}
                />
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={loading || !editingRole || !name.trim()}
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
                onClick={() => setEditingRole(null)}
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

function DeleteMemberRoleDialog({
  role,
  canDeleteRoles,
  isOwnerRole,
  loading,
  setLoading,
}: {
  role: ProjectMemberRole
  canDeleteRoles: boolean
  isOwnerRole: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()

  const [deletingRole, setDeletingRole] = useState<ProjectMemberRole | null>(
    null
  )

  async function handleDeleteRole(role: ProjectMemberRole) {
    setLoading(true)
  }

  return (
    <AlertDialog
      open={!!deletingRole}
      onOpenChange={(open) => !open && setDeletingRole(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteRoles || isOwnerRole || loading
                ? "cursor-not-allowed"
                : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteRoles || isOwnerRole || loading}
                onClick={() => setDeletingRole(role)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteRoles && (
          <TooltipContent>
            You don&rsquo;t have permission to delete roles.
          </TooltipContent>
        )}
        {isOwnerRole && (
          <TooltipContent>
            The Owner role cannot be deleted as it is required for project
            ownership and permissions management.
          </TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              role{" "}
              <span className="font-mono">
                {deletingRole?.name} ({deletingRole?.id.slice(0, 8)})
              </span>{" "}
              and all associated translations in all projects. Please confirm
              that you want to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingRole(null)}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingRole === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingRole) return

                void handleDeleteRole(deletingRole)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Deleting role...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Delete Role
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
