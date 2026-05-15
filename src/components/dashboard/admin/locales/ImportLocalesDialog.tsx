"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ImportIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"

const IMPORTABLE_LOCALES: { language: string; region?: string; code: string }[] = [
  
]

export default function ImportLocalesDialog({
  canCreateLocale,
}: {
  canCreateLocale: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleImportLocales = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setDialogOpen(false)
    }, 1000)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreateLocale || loading ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateLocale || loading}>
              <Button
                variant="outline"
                aria-disabled={!canCreateLocale || loading}
              >
                <ImportIcon className="mr-2 h-4 w-4" />
                Import Locales
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateLocale && (
          <TooltipContent>
            You don&rsquo;t have permission to create new locales.
          </TooltipContent>
        )}
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Locales</DialogTitle>
          <DialogDescription>
            Select which locales you want to import into your system.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleImportLocales}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Importing...
              </>
            ) : (
              <>
                <ImportIcon className="h-4 w-4" />
                Import Locales
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
