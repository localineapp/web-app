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
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectLabel } from "@prisma/client"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PAGE_SIZE = 10

export default function LabelsTable({
  labels,
  canManageLabels,
}: {
  labels: ProjectLabel[]
  canManageLabels: boolean
}) {
  const router = useRouter()

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

                  <TableCell>{label.description}</TableCell>

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
