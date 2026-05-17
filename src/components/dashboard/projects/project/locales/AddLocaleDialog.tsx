"use client"

import { FullProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import { Locale } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";

export default function AddLocaleDialog({
  session,
  project,
  locales,
}: {
  session: ReturnType<typeof useSession>["data"]
  project: FullProject
  locales: Locale[]
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [locale, setLocale] = useState<Locale | null>(null)

  const user = session?.user

  const canAddLocales = true // TODO: Determine if the user can add locales based on their membership role
  const isLimitReached = project.plan.localesLimit !== null && project.locales.length >= project.plan.localesLimit

  const handleAddLocale = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canAddLocales && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canAddLocales || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canAddLocales || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Locale
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {(!canAddLocales || isLimitReached) && (
          <TooltipContent>
            {!canAddLocales
              ? "You don't have permission to add locales in this project."
              : isLimitReached ?? "This project has reached the maximum number of locales allowed by your plan."}
          </TooltipContent>
        )}
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new locale</DialogTitle>
          <DialogDescription>
            Add a new locale to your project.
          </DialogDescription>
        </DialogHeader>
        <Combobox items={locales.map((locale) => ({
          id: locale.id,
          displayName: locale.displayName,
        }))} onInputValueChange={(value) => {
          const matchedLocale = locales.find((locale) => locale.displayName === value)
          setLocale(matchedLocale || null)
        }}>
          <ComboboxInput placeholder="Select a locale" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {({ id, displayName }) => (
                <ComboboxItem key={id} value={displayName}>
                  {displayName}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setLocale(null)
            }}
            disabled={loading}
          >
            Cancel
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