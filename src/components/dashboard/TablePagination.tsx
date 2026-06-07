import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function TablePagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  total,
  setPage,
}: {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  total: number
  setPage: (page: number) => void
}) {
  return (
    <div className="mt-2 flex items-center justify-between px-2 text-sm text-muted-foreground">
      <div>
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage > 1) setPage(currentPage - 1)
                }}
                className={
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            <div className="text-sm text-muted-foreground">
              Showing {startIndex}-{endIndex} of {total}
            </div>

            <PaginationItem>
              <PaginationNext
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage < totalPages) setPage(currentPage + 1)
                }}
                className={
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
