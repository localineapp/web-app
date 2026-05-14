"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CopyIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authClient, useSession } from "@/lib/auth-client"
import { auth } from "@/lib/auth"

const PAGE_SIZE = 10

function formatDate(value: Date | string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Unknown"

  return format(date, "PP p")
}

function getDeviceLabel(userAgent?: string | null) {
  if (!userAgent) return "Unknown device"

  const normalized = userAgent.toLowerCase()

  if (normalized.includes("iphone") || normalized.includes("ipad"))
    return "Apple Mobile"
  if (normalized.includes("android")) return "Android"
  if (normalized.includes("windows")) return "Windows"
  if (normalized.includes("macintosh") || normalized.includes("mac os"))
    return "Mac"
  if (normalized.includes("linux")) return "Linux"

  return "Desktop"
}

function getBrowserLabel(userAgent?: string | null) {
  if (!userAgent) return null

  const normalized = userAgent.toLowerCase()

  if (normalized.includes("edg/")) return "Edge"
  if (normalized.includes("chrome/") && !normalized.includes("edg/"))
    return "Chrome"
  if (normalized.includes("firefox/")) return "Firefox"
  if (normalized.includes("safari/") && !normalized.includes("chrome/"))
    return "Safari"

  return null
}

export default function SessionsTable({
  session,
  sessions,
}: {
  session: ReturnType<typeof useSession>["data"]
  sessions: Awaited<ReturnType<typeof auth.api.listSessions>>
}) {
  const router = useRouter()
  const [page, setPage] = useState(1)

  const currentSessionId = session?.session?.id

  const total = sessions.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = Math.min(total, page * PAGE_SIZE)
  const currentSessions = sessions.slice(startIndex, endIndex)

  function copySessionId(sessionId: string) {
    try {
      navigator.clipboard.writeText(sessionId)
      toast.success("Session ID copied to clipboard.")
    } catch {
      toast.error("Failed to copy session ID.")
    }
  }

  function handleRevokeSession(token: string) {
    authClient.revokeSession({
      token,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Session revoked.")
          router.refresh()
        },
        onError: () => {
          toast.error("Failed to revoke session.")
        },
      },
    })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 text-center">Session</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentSessions.length > 0 ? (
              currentSessions.map((session) => {
                const isCurrentSession = session.id === currentSessionId
                const browserLabel = getBrowserLabel(session.userAgent)

                return (
                  <TableRow key={session.id}>
                    <TableCell className="text-center font-medium">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-sm"
                            title={session.id}
                          >
                            {session.id.slice(0, 8)}
                          </span>
                          <Badge
                            variant={isCurrentSession ? "default" : "outline"}
                          >
                            {isCurrentSession ? "Current" : "Active"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Created {formatDate(session.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{getDeviceLabel(session.userAgent)}</span>
                        <span
                          className="max-w-[18rem] truncate text-xs text-muted-foreground"
                          title={session.userAgent ?? undefined}
                        >
                          {browserLabel
                            ? `${browserLabel}${session.userAgent ? ` • ${session.userAgent}` : ""}`
                            : (session.userAgent ?? "No user agent available")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>{session.ipAddress ?? "Unknown"}</TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{formatDate(session.expiresAt)}</span>
                        <span className="text-xs text-muted-foreground">
                          Updated {formatDate(session.updatedAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="inline-flex items-center p-1 text-sm"
                          aria-label={`Copy session ID`}
                          onClick={() => {
                            void copySessionId(session.id)
                          }}
                        >
                          <CopyIcon size={16} />
                        </Button>

                        {isCurrentSession ? (
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
                                  aria-label="Current session cannot be revoked"
                                  disabled
                                >
                                  <TrashIcon size={16} />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              You can&rsquo;t revoke the current session.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="inline-flex items-center p-1 text-sm"
                            aria-label="Revoke session"
                            onClick={(event) => {
                              event.preventDefault()
                              void handleRevokeSession(session.token)
                            }}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        )}
                      </div>
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
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
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
                  onClick={(event) => {
                    event.preventDefault()
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
                  onClick={(event) => {
                    event.preventDefault()
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
    </div>
  )
}
