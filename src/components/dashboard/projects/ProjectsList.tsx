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
import { CogIcon, ExternalLinkIcon, FolderCodeIcon } from "lucide-react"
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
import { Project } from "@prisma/client"
import { cn } from "@/lib/utils"

interface ProjectsListProps {
  projects: Project[]
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
  projects = [],
}: {
  session: ReturnType<typeof useSession>["data"]
  projects: Project[]
}) {
  const [view, setView] = useState<"table" | "cards">("table")
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    const v = getCookie(COOKIE_NAME)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v === "cards" || v === "table") setView(v as "cards" | "table")
  }, [])

  function selectView(next: "table" | "cards") {
    setView(next)
    setCookie(COOKIE_NAME, next, 365)
  }

  if (projects.length == 0) {
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
          <CreateProjectDialog
            session={session}
            projectCount={projects.length}
          />
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
        <ProjectsTable projects={projects} page={page} setPage={setPage} />
      ) : (
        <ProjectCards projects={projects} page={page} setPage={setPage} />
      )}
    </div>
  )
}

export function ProjectCards({ projects, page, setPage }: ProjectsListProps) {
  const router = useRouter()

  const total = projects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_CARDS))
  const startIndex = (page - 1) * PAGE_SIZE_CARDS
  const endIndex = Math.min(total, page * PAGE_SIZE_CARDS)
  const currentProjects = projects.slice(startIndex, endIndex)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentProjects.map(({ id, name, description }) => (
          <Link key={id} href={`/projects/${id}`} className="block">
            <Card
              key={id}
              className="cursor-pointer transition hover:-translate-y-0.5 hover:opacity-80 hover:shadow-sm"
            >
              <CardHeader>
                <div>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription
                    className={cn(
                      !description && "text-muted-foreground italic"
                    )}
                  >
                    {description ?? "No description."}
                  </CardDescription>
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
                      router.push(`/projects/${id}/settings`)
                    }}
                  >
                    <CogIcon size={16} />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-muted-foreground">
                  ID: {id.slice(0, 8)}
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

export function ProjectsTable({ projects, page, setPage }: ProjectsListProps) {
  const total = projects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_TABLE))
  const startIndex = (page - 1) * PAGE_SIZE_TABLE
  const endIndex = Math.min(total, page * PAGE_SIZE_TABLE)
  const currentProjects = projects.slice(startIndex, endIndex)

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
            {currentProjects.map(({ id, name, description }) => (
              <TableRow key={id}>
                <TableCell className="text-center font-medium">
                  <Link
                    href={`/projects/${id}`}
                    className="block h-full w-full"
                  >
                    {id.slice(0, 8)}
                  </Link>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/projects/${id}`}
                    className="block h-full w-full"
                  >
                    {name}
                  </Link>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/projects/${id}`}
                    className={cn(
                      "block h-full w-full",
                      !description && "text-muted-foreground italic"
                    )}
                  >
                    {description ?? "None"}
                  </Link>
                </TableCell>

                <TableCell className="cursor-default text-center">
                  <Link
                    href={`/projects/${id}`}
                    className="inline-flex items-center px-2 py-1 text-sm"
                  >
                    <ExternalLinkIcon size={16} />
                  </Link>
                  <Link
                    href={`/projects/${id}/settings`}
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
