"use client"

import {
  removeProjectMember,
  updateProjectMember,
} from "@/actions/project-members"
import TablePagination from "@/components/dashboard/TablePagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import RolePickerField from "@/components/ui/custom/RolePickerField"
import ProjectLocalesPicker from "@/components/ui/custom/ProjectLocalesPicker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { generateRoleBadge } from "@/lib/project-utils"
import { cn, formatDate } from "@/lib/utils"
import {
  FullProjectMember,
  ProjectLocaleWithLocale,
} from "@/types/project"
import { ProjectMember, ProjectMemberRole } from "@prisma/client"
import {
  AlertTriangleIcon,
  GlobeIcon,
  PencilIcon,
  SearchIcon,
  ShieldCogIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useSession } from "@/components/session-provider"
import { useProject } from "@/components/project-provider"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { authClient } from "@/lib/auth-client"

const PAGE_SIZE = 10

export default function MembersTable({
  members,
}: {
  members: FullProjectMember[]
}) {
  const { user } = useSession()
  const { project } = useProject()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredMembers = normalizedSearchQuery
    ? members.filter(
        (projectMember) =>
          (projectMember.id ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (projectMember.user.name ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (projectMember.user.email ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery)
      )
    : members

  const total = filteredMembers.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentMembers = filteredMembers.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search members by ID, name, or email..."
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
              <TableHead className="text-center">Role</TableHead>
              <TableHead>Assigned Locales</TableHead>
              <TableHead>Member since</TableHead>
              <TableHead className="max-w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentMembers.length > 0 ? (
              currentMembers.map((projectMember) => {
                const isOwner = projectMember.role.id === project.id
                return (
                  <TableRow key={projectMember.id}>
                    <TableCell className="text-center">
                      {projectMember.id.slice(0, 8)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <span className="font-mono text-sm">
                            {projectMember.user.name}
                          </span>
                          {projectMember.user.id === user?.id && (
                            <Badge>You</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          E-Mail:{" "}
                          <span
                            className={cn(
                              projectMember.user.email === "" && "blur-xs"
                            )}
                          >
                            {projectMember.user.email ||
                              projectMember.user.id.slice(0, 8) +
                                "@localine.app"}
                          </span>
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {generateRoleBadge(
                        projectMember.role.name,
                        projectMember.role.color ?? undefined,
                        projectMember.role.icon ?? undefined
                      )}
                    </TableCell>

                    <TableCell>
                      {projectMember.locales.length > 0 ? (
                        projectMember.locales.map((locale) => (
                          <Badge
                            key={locale.id}
                            variant="outline"
                            className="mr-1 mb-1"
                          >
                            {locale.locale.displayName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic">
                          No specific locales assigned
                        </span>
                      )}
                    </TableCell>

                    <TableCell>{formatDate(projectMember.createdAt)}</TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <EditMemberRoleDialog
                          projectMember={projectMember}
                          isOwner={isOwner}
                          loading={loading}
                          setLoading={setLoading}
                        />
                        <EditMemberLocalesDialog
                          projectMember={projectMember}
                          isOwner={isOwner}
                          loading={loading}
                          setLoading={setLoading}
                        />
                        <RemoveMemberDialog
                          projectMember={projectMember}
                          isOwner={isOwner}
                          loading={loading}
                          setLoading={setLoading}
                        />
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
                    ? "No members found matching your search."
                    : "No members found."}
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

function EditMemberRoleDialog({
  projectMember,
  isOwner,
  loading,
  setLoading,
}: {
  projectMember: FullProjectMember
  isOwner: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const { user } = useSession()
  const { project, member } = useProject()

  const [editingMember, setEditingMember] = useState<FullProjectMember | null>()

  const [role, setRole] = useState<ProjectMemberRole | null>(projectMember.role)

  const canUpdateMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.UPDATE_MEMBERS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  function openDialog(projectMember: FullProjectMember) {
    setEditingMember(projectMember)
    setRole(projectMember.role)
  }

  function closeEditor() {
    setEditingMember(null)
    setRole(null)
  }

  async function handleUpdateRole(projectMember: FullProjectMember) {
    setLoading(true)
    if (!role) return

    await updateProjectMember({
      projectId: projectMember.projectId,
      memberId: projectMember.id,
      roleId: role.id,
    })
      .then(() => {
        toast.success(
          `The role of ${projectMember.user.name} has been updated to ${role.name}.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update member role. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setEditingMember(null)
        setRole(null)
      })
  }

  return (
    <Dialog
      open={editingMember?.id === projectMember.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canUpdateMembers || isOwner || loading
                ? "cursor-not-allowed"
                : ""
            )}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateMembers || isOwner || loading}
                onClick={() => openDialog(projectMember)}
              >
                <ShieldCogIcon size={16} />
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canUpdateMembers && (
          <TooltipContent>
            You don&rsquo;t have permission to update members.
          </TooltipContent>
        )}
        {isOwner && (
          <TooltipContent>
            The owner&rsquo;s role cannot be changed.
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent
        className={cn(editingMember?.user.id === user?.id && "sm:max-w-130")}
      >
        <DialogHeader>
          <DialogTitle>Update Member Role</DialogTitle>
          <DialogDescription>
            You are updating the role of{" "}
            <span className="font-medium">{editingMember?.user.name}</span>.
            Please select a new role for this member.
          </DialogDescription>

          {editingMember?.user.id === user?.id && (
            <Alert className="mt-2 border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
              <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
              <AlertTitle>Updating Own Role</AlertTitle>
              <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
                Changing your own role may affect your permissions in the
                project. You may lose access to certain features or the ability
                to manage members if you select a role with fewer permissions.
                Please proceed with caution.
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="role">Role</Label>
          <RolePickerField
            id={`role-${editingMember?.id}`}
            roles={project.memberRoles
              .filter((role) => role.id !== project.id)
              .sort((a, b) => {
                if (a.permissions !== b.permissions) {
                  return a.permissions > b.permissions ? -1 : 1
                }

                return a.name.localeCompare(b.name)
              })}
            value={role?.id ?? ""}
            onChange={(roleId) =>
              setRole(
                project.memberRoles.find((role) => role.id === roleId) ?? null
              )
            }
            disabled={loading}
            allowNone={false}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditingMember(null)}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            disabled={
              loading ||
              editingMember === null ||
              role?.id === editingMember?.role.id
            }
            onClick={(event) => {
              event.preventDefault()
              if (!editingMember) return
              void handleUpdateRole(editingMember)
            }}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Updating role...
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4" />
                Update Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditMemberLocalesDialog({
  projectMember,
  isOwner,
  loading,
  setLoading,
}: {
  projectMember: FullProjectMember
  isOwner: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const { user } = useSession()
  const { project, member } = useProject()

  const [editingMember, setEditingMember] = useState<FullProjectMember | null>()

  const [locales, setLocales] = useState<ProjectLocaleWithLocale[]>(
    projectMember.locales
  )

  const canUpdateMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.UPDATE_MEMBERS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  function openDialog(projectMember: FullProjectMember) {
    setEditingMember(projectMember)
    setLocales(projectMember.locales)
  }

  function closeEditor() {
    setEditingMember(null)
    setLocales([])
  }

  async function handleUpdateLocales(
    projectMember: FullProjectMember
  ) {
    setLoading(true)
    if (!locales) return

    await updateProjectMember({
      projectId: projectMember.projectId,
      memberId: projectMember.id,
      locales,
    })
      .then(() => {
        toast.success(
          `The locales of ${projectMember.user.name} have been updated.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update member locales. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setEditingMember(null)
        setLocales([])
      })
  }

  return (
    <Dialog
      open={editingMember?.id === projectMember.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canUpdateMembers || isOwner || loading
                ? "cursor-not-allowed"
                : ""
            )}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateMembers || isOwner || loading}
                onClick={() => openDialog(projectMember)}
              >
                <GlobeIcon size={16} />
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canUpdateMembers && (
          <TooltipContent>
            You don&rsquo;t have permission to update members.
          </TooltipContent>
        )}
        {isOwner && (
          <TooltipContent>
            The owner can&rsquo;t have specific locales assigned.
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Member Locales</DialogTitle>
          <DialogDescription>
            You are updating the locales of{" "}
            <span className="font-medium">{editingMember?.user.name}</span>.
            Please select new locales for this member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="locales">Assigned Locales</Label>
          <ProjectLocalesPicker
            id={`locales-${editingMember?.id}`}
            locales={project.locales}
            value={locales}
            onChange={setLocales}
            disabled={loading || !canUpdateMembers || isOwner}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditingMember(null)}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            disabled={loading || editingMember === null}
            onClick={(event) => {
              event.preventDefault()
              if (!editingMember) return
              void handleUpdateLocales(editingMember)
            }}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Updating locales...
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4" />
                Update Locales
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveMemberDialog({
  projectMember,
  isOwner,
  loading,
  setLoading,
}: {
  projectMember: FullProjectMember
  isOwner: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const { user } = useSession()
  const { member } = useProject()

  const [removingMember, setRemovingMember] = useState<FullProjectMember | null>(null)

  const canRemoveMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.REMOVE_MEMBERS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  async function handleRemoveMember(currentMember: ProjectMember) {
    setLoading(true)

    await removeProjectMember({
      projectId: currentMember.projectId,
      memberId: currentMember.id,
    })
      .then((projectMember) => {
        toast.success(`Removed member ${projectMember.user.name}.`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to remove member. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setRemovingMember(null)
      })
  }

  return (
    <AlertDialog
      open={!!removingMember}
      onOpenChange={(open) => !open && setRemovingMember(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canRemoveMembers || isOwner || loading
                ? "cursor-not-allowed"
                : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canRemoveMembers || isOwner || loading}
                onClick={() => setRemovingMember(projectMember)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canRemoveMembers && (
          <TooltipContent>
            You don&rsquo;t have permission to remove members.
          </TooltipContent>
        )}
        {isOwner && (
          <TooltipContent>
            The owner can&rsquo;t be removed from the project.
          </TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              member{" "}
              <span className="font-mono">
                {removingMember?.user.name} (
                {removingMember?.user.id.slice(0, 8)})
              </span>
              .
            </AlertDialogDescription>

            {removingMember?.user.id === user?.id && (
              <Alert className="mt-4 border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
                <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
                <AlertTitle>Removing Own Membership</AlertTitle>
                <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
                  You are about to remove your own membership from this project.
                  This will result in losing access to the project and all its
                  resources. You will need to be re-invited by another member to
                  regain access. Please proceed with caution.
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setRemovingMember(null)}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || removingMember === null}
              onClick={(event) => {
                event.preventDefault()
                if (!removingMember) return
                void handleRemoveMember(removingMember)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Removing member...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Remove Member
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
