"use client"

import { addProjectLocale } from "@/actions/project-locales"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { FullProject } from "@/types/project"
import { Locale } from "@prisma/client"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"
import LocalePickerField from "@/components/ui/custom/LocalePickerField"

export default function AddLocaleDialog({
  project,
  locales,
  canManageLocales,
}: {
  project: FullProject
  locales: Locale[]
  canManageLocales: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [locale, setLocale] = useState<Locale | null>(null)

  const isLimitReached =
    project.plan.localesLimit !== null &&
    project.locales.length >= project.plan.localesLimit

  const handleAddLocale = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!locale) {
      toast.error("Please select a locale to add.")
      return
    }

    setLoading(true)
    await addProjectLocale({
      projectId: project.id,
      localeId: locale.id,
    })
      .then(() => {
        toast.success(
          `The locale ${locale.displayName} has been added to the project.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(error?.message || `Failed to add locale. Please try again.`)
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setLocale(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canManageLocales && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canManageLocales || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canManageLocales || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Locale
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canManageLocales ? (
          <TooltipContent>
            You don&rsquo;t have permission to add locales in this project.
          </TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {project.plan.localesLimit === 0
                ? "Your current plan does not allow adding locales."
                : `This project has reached the maximum number of locales allowed by your plan (${project.locales.length}/${project.plan.localesLimit}).`}
            </TooltipContent>
          )
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new locale</DialogTitle>
          <DialogDescription>
            Add a new locale to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="locale">Locale</Label>
          <LocalePickerField
            id="locale"
            locales={locales}
            value={locale}
            onChange={setLocale}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setLocale(null)
            }}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handleAddLocale}
            disabled={!locale || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Adding...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Add Locale
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
