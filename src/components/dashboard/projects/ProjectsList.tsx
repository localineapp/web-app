"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CogIcon,
  ExternalLinkIcon,
  FolderCodeIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import CreateProjectDialog from "./CreateProjectDialog"
import { useSession } from "@/lib/auth-client"

const mockProjects: Array<{
  uniqueId: string
  name: string
  description: string
}> = [
  {
    uniqueId: "15f3d8a3-a833-486c-bb6a-cedf248fb60b",
    name: "Project Alpha",
    description: "A project for testing the alpha features.",
  },
  {
    uniqueId: "7d8c40c3-6da9-4c96-9393-4a8eda903e22",
    name: "Project Beta",
    description: "A project for testing the beta features.",
  },
  {
    uniqueId: "927fa473-4836-40ef-8896-98727eb5f738",
    name: "Project Gamma",
    description: "A project for testing the gamma features.",
  },
  {
    uniqueId: "9b7f82d7-d222-4ca5-8d31-8a61aea02470",
    name: "Project Delta",
    description: "A project for testing the delta features.",
  },
  {
    uniqueId: "d3e4f5a6-7b8c-9d0e-f1a2-3b4c5d6e7f89",
    name: "Project Epsilon",
    description: "A project for testing the epsilon features.",
  },
  {
    uniqueId: "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
    name: "Project Zeta",
    description: "A project for testing the zeta features.",
  },
  {
    uniqueId: "b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7",
    name: "Project Eta",
    description: "A project for testing the eta features.",
  },
  {
    uniqueId: "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
    name: "Project Theta",
    description: "A project for testing the theta features.",
  },
  {
    uniqueId: "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
    name: "Project Iota",
    description: "A project for testing the iota features.",
  },
  {
    uniqueId: "e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0",
    name: "Project Kappa",
    description: "A project for testing the kappa features.",
  },
  {
    uniqueId: "f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1",
    name: "Project Lambda",
    description: "A project for testing the lambda features.",
  },
  {
    uniqueId: "g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2",
    name: "Project Mu",
    description: "A project for testing the mu features.",
  },
  {
    uniqueId: "h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3",
    name: "Project Nu",
    description: "A project for testing the nu features.",
  },
  {
    uniqueId: "i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4",
    name: "Project Xi",
    description: "A project for testing the xi features.",
  },
  {
    uniqueId: "j0k1l2m3-n4o5-p6q7-r8s9-t0u1v2w3x4y5",
    name: "Project Omicron",
    description: "A project for testing the omicron features.",
  },
  {
    uniqueId: "k1l2m3n4-o5p6-q7r8-s9t0-u1v2w3x4y5z6",
    name: "Project Pi",
    description: "A project for testing the pi features.",
  },
  {
    uniqueId: "l2m3n4o5-p6q7-r8s9-t0u1-v2w3x4y5z6a7",
    name: "Project Sigma",
    description: "A project for testing the sigma features.",
  },
  {
    uniqueId: "m3n4o5p6-q7r8-s9t0-u1v2-w3x4y5z6a7b8",
    name: "Project Tau",
    description: "A project for testing the tau features.",
  },
]

interface ProjectsListProps {
  page: number
  setPage: (page: number) => void
}

const PAGE_SIZE_TABLE: number = 10
const PAGE_SIZE_CARDS: number = 9
const COOKIE_NAME = "localine.projects_view"

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`
}

export default function ProjectsList({
  session,
}: {
  session: ReturnType<typeof useSession>["data"]
}) {
  const [view, setView] = useState<"table" | "cards">("table")
  const [page, setPage] = useState<number>(1)

  const total = mockProjects.length

  useEffect(() => {
    const v = getCookie(COOKIE_NAME)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v === "cards" || v === "table") setView(v as "cards" | "table")
  }, [])

  function selectView(next: "table" | "cards") {
    setView(next)
    setCookie(COOKIE_NAME, next, 365)
  }

  if (total == 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCodeIcon />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating
            your first project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateProjectDialog session={session} />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">View</span>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => {
              if (v === "table" || v === "cards")
                selectView(v as "table" | "cards")
            }}
            aria-label="Select view"
            className="ml-2"
          >
            <ToggleGroupItem value="table">Table</ToggleGroupItem>
            <ToggleGroupItem value="cards">Cards</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {view === "table" ? (
        <ProjectsTable page={page} setPage={setPage} />
      ) : (
        <ProjectCards page={page} setPage={setPage} />
      )}
    </div>
  )
}

export function ProjectCards({ page, setPage }: ProjectsListProps) {
  const router = useRouter()

  const total = mockProjects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_CARDS))
  const startIndex = (page - 1) * PAGE_SIZE_CARDS
  const endIndex = Math.min(total, page * PAGE_SIZE_CARDS)
  const currentProjects = mockProjects.slice(startIndex, endIndex)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentProjects.map(({ uniqueId, name, description }) => (
          <Link key={uniqueId} href={`/projects/${uniqueId}`} className="block">
            <Card
              key={uniqueId}
              className="cursor-pointer transition hover:-translate-y-0.5 hover:opacity-80 hover:shadow-sm"
            >
              <CardHeader>
                <div>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>

                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="inline-flex items-center p-1 text-sm"
                    aria-label="Project settings"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      router.push(`/projects/${uniqueId}/settings`)
                    }}
                  >
                    <CogIcon size={16} />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-muted-foreground">
                  ID: {uniqueId.split("-")[0]}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between px-2 text-sm text-muted-foreground">
        <div>
          Page {page} of {totalPages}
        </div>

        <div className="flex items-center gap-4">
          <Pagination aria-label="Pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
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
                  onClick={(e) => {
                    e.preventDefault()
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
    </>
  )
}

export function ProjectsTable({ page, setPage }: ProjectsListProps) {
  const total = mockProjects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_TABLE))
  const startIndex = (page - 1) * PAGE_SIZE_TABLE
  const endIndex = Math.min(total, page * PAGE_SIZE_TABLE)
  const currentProjects = mockProjects.slice(startIndex, endIndex)

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25 text-center">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-25 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjects.map(({ uniqueId, name, description }) => (
              <TableRow key={uniqueId}>
                <TableCell className="text-center font-medium">
                  <Link
                    href={`/projects/${uniqueId}`}
                    className="block h-full w-full"
                  >
                    {uniqueId.split("-")[0]}
                  </Link>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/projects/${uniqueId}`}
                    className="block h-full w-full"
                  >
                    {name}
                  </Link>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/projects/${uniqueId}`}
                    className="block h-full w-full"
                  >
                    {description}
                  </Link>
                </TableCell>

                <TableCell className="cursor-default text-center">
                  <Link
                    href={`/projects/${uniqueId}`}
                    className="inline-flex items-center px-2 py-1 text-sm"
                  >
                    <ExternalLinkIcon size={16} />
                  </Link>
                  <Link
                    href={`/projects/${uniqueId}/settings`}
                    className="inline-flex items-center px-2 py-1 text-sm"
                  >
                    <CogIcon size={16} />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
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
                  onClick={(e) => {
                    e.preventDefault()
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
                  onClick={(e) => {
                    e.preventDefault()
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
    </>
  )
}
