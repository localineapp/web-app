"use client"

import TablePagination from "@/components/dashboard/table-pagination"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { generateRoleBadge } from "@/lib/project-utils"
import { cn, formatDate } from "@/lib/utils"
import { ProjectMemberWithUserAndRole } from "@/types/project"
import { SearchIcon } from "lucide-react"
import { useState } from "react"

const PAGE_SIZE = 10

export default function MembersTable({
  projectMembers,
  canUpdateMembers,
  canRemoveMembers,
}: {
  projectMembers: ProjectMemberWithUserAndRole[]
  canUpdateMembers: boolean
  canRemoveMembers: boolean
}) {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjectMembers = normalizedSearchQuery
    ? projectMembers.filter(
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
    : projectMembers

  const total = filteredProjectMembers.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentProjectMembers = filteredProjectMembers.slice(
    startIndex,
    endIndex
  )
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
            {currentProjectMembers.length > 0 ? (
              currentProjectMembers.map((projectMember) => (
                <TableRow key={projectMember.id}>
                  <TableCell className="text-center">
                    {projectMember.id.slice(0, 8)}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{projectMember.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        E-Mail:{" "}
                        <span
                          className={cn(
                            projectMember.user.email ===
                              "hidden@localine.app" && "blur-xs"
                          )}
                        >
                          {projectMember.user.email}
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
                      projectMember.locales.map((locale) => <></>)
                    ) : (
                      <span className="text-muted-foreground italic">
                        No locales assigned
                      </span>
                    )}
                  </TableCell>

                  <TableCell>{formatDate(projectMember.createdAt)}</TableCell>

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
