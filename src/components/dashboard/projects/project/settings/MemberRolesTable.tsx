"use client"

import TablePagination from "@/components/dashboard/table-pagination"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPermissions } from "@/lib/project-permissions"
import {
  getRoleColorClassName,
  getRoleColorStyle,
  getRoleIcon,
} from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { Project, ProjectMemberRole } from "@prisma/client"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
  const filteredPlans = normalizedSearchQuery
    ? memberRoles.filter(
        (role) =>
          (role.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (role.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : memberRoles

  const total = filteredPlans.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentRoles = filteredPlans.slice(startIndex, endIndex)
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

                  <TableCell className="min-w-40">{role.name}</TableCell>

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
                          style={getRoleColorStyle(role.color)}
                          className={getRoleColorClassName(role.color)}
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
                        const RoleIcon = getRoleIcon(role.icon)
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
                      <p>None</p>
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
