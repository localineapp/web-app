"use client"

import { createLocale } from "@/actions/locales"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateLocaleDialog({
  canCreateLocales,
}: {
  canCreateLocales: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [language, setLanguage] = useState("")
  const [region, setRegion] = useState<string | null>(null)
  const [code, setCode] = useState("")

  const handleCreateLocale = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    const displayName = `${language}${region ? ` (${region})` : ""}`

    await createLocale({
      displayName,
      language,
      region: region || undefined,
      code,
      enabled: true,
    })
      .then(() => {
        toast.success(`Created locale ${displayName} (${code}).`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to create locale. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setLanguage("")
        setRegion(null)
        setCode("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreateLocales || loading ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateLocales || loading}>
              <Button variant="outline" disabled={!canCreateLocales || loading}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Locale
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateLocales && (
          <TooltipContent>
            You don&rsquo;t have permission to create a new locale.
          </TooltipContent>
        )}
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new locale</DialogTitle>
          <DialogDescription>Add a new locale to the system.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="localeLanguage">Language</Label>
            <Input
              id="localeLanguage"
              placeholder="e.g. English"
              value={language}
              onChange={({ target: { value } }) => setLanguage(value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localeRegion">Region (optional)</Label>
            <Input
              id="localeRegion"
              placeholder="e.g. United States"
              value={region || ""}
              onChange={({ target: { value } }) => setRegion(value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localeCode">Locale code</Label>
            <Input
              id="localeCode"
              placeholder="e.g. en_US"
              value={code}
              onChange={({ target: { value } }) => setCode(value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setLanguage("")
              setRegion("")
              setCode("")
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateLocale}
            disabled={!language || !code || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Locale
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
