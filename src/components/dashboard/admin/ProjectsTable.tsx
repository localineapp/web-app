"use client"

import { FullProject } from "@/actions/projects"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ExternalLinkIcon, FoldersIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import TablePagination from "@/components/dashboard/table-pagination"

const PAGE_SIZE = 10

export default function ProjectsTable({
  projects,
}: {
  projects: FullProject[]
}) {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjects = normalizedSearchQuery
    ? projects.filter(
        (project) =>
          (project.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (project.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : projects

  const total = filteredProjects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentProjects = filteredProjects.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  if (total === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FoldersIcon />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            There have been no projects created yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div>
      <div className="relative mb-2 flex w-full max-w-md items-center">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className="pl-10"
          placeholder="Search projects by name or ID..."
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
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjects.length > 0 ? (
              currentProjects.map(({ id, name, description, members }) => {
                const owner = members.find(
                  (member) => member.roleId === id
                )?.user

                return (
                  <TableRow key={id}>
                    <TableCell className="text-center">
                      {id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">{name}</TableCell>

                    <TableCell
                      className={cn(
                        !description && "text-muted-foreground italic"
                      )}
                    >
                      {description ?? "None"}
                    </TableCell>

                    <TableCell className="max-w-30">
                      {owner ? (
                        <>
                          <span className="text-sm font-medium text-foreground sm:hidden">
                            {owner.name || "Unknown User"}
                          </span>

                          <div className="hidden w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 sm:inline-flex">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarImage
                                src={owner.image || undefined}
                                alt={owner.name || "Unknown User"}
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {owner.name
                                  ? owner.name.charAt(0).toUpperCase()
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-full truncate text-sm font-medium text-foreground">
                              {owner.name || "Unknown User"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No owner
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Link
                        href={`/projects/${id}`}
                        className="inline-flex items-center px-2 py-1 text-sm"
                      >
                        <ExternalLinkIcon size={16} />
                      </Link>
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
                  {searchQuery
                    ? "No projects found matching your search."
                    : "No projects found."}
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
    </div>
  )
}
