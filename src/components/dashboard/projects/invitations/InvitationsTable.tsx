"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ProjectInvitationWithProjectAndRole } from "@/types/project"
import { EyeIcon, SearchIcon } from "lucide-react"
import { useState } from "react"
import TablePagination from "@/components/dashboard/table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateRoleBadge } from "@/lib/project-utils"
import { formatDate } from "@/lib/utils"

const PAGE_SIZE = 10

export default function InvitationsTable({
  invitations,
}: {
  invitations: ProjectInvitationWithProjectAndRole[]
}) {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredInvitations = normalizedSearchQuery
    ? invitations.filter(
        (invitation) =>
          (invitation.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (invitation.project?.name ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery)
      )
    : invitations

  const total = filteredInvitations.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentInvitations = filteredInvitations.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder="Search invitations by ID or project..."
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
              <TableHead>Project Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Expires at</TableHead>
              <TableHead className="max-w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {invitations.length > 0 ? (
              currentInvitations.map(async (invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="text-center">
                    {invitation.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {invitation.project?.name}
                  </TableCell>

                  <TableCell>
                    {generateRoleBadge(
                      invitation.role.name,
                      invitation.role.color ?? undefined,
                      invitation.role.icon ?? undefined
                    )}
                  </TableCell>

                  <TableCell>{formatDate(invitation.expiresAt)}</TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" asChild>
                        <Link
                          className="text-sm font-medium text-primary"
                          href={`/projects/invitations/${invitation.token}`}
                          prefetch={false}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
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
                    ? "No invitations found matching your search."
                    : "No invitations found."}
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
