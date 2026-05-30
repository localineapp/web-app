"use client"

import { addProjectLocale } from "@/actions/project-locales"
import { Button } from "@/components/ui/button"
import LocalePickerField from "@/components/ui/custom/LocalePickerField"
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
  const [localeId, setLocaleId] = useState("")

  const selectedLocale = locales.find((locale) => locale.id === localeId)

  const isLimitReached =
    project.plan.localesLimit !== null &&
    project.locales.length >= project.plan.localesLimit

  const handleAddLocale = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    if (!selectedLocale) {
      toast.error("Please select a locale.")
      setLoading(false)
      return
    }

    await addProjectLocale({
      projectId: project.id,
      localeId: selectedLocale.id,
    })
      .then(() => {
        toast.success(
          `The locale ${selectedLocale.displayName} has been added to the project.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            `Failed to add locale. Please try again.`
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setLocaleId("")
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

        <LocalePickerField
          id="locale"
          label="Locale"
          locales={locales}
          value={localeId}
          onChange={setLocaleId}
          disabled={loading}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setLocaleId("")
            }}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handleAddLocale}
            disabled={!selectedLocale || loading}
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
