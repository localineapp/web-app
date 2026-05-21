"use client"

import { createPlan } from "@/actions/plans"
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

export default function CreatePlanDialog({
  canCreatePlans,
}: {
  canCreatePlans: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState<string | null>(null)

  const handleCreatePlan = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createPlan({
      displayName,
      description: description || undefined,
    })
      .then(() => {
        toast.success(`Created plan ${displayName}.`)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to create plan. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setDisplayName("")
        setDescription(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreatePlans || loading ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreatePlans || loading}>
              <Button
                variant="outline"
                aria-disabled={!canCreatePlans || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreatePlans && (
          <TooltipContent>
            You don&rsquo;t have permission to create a new plan.
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new plan</DialogTitle>
          <DialogDescription>Add a new plan to the system.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="planName">Plan Name</Label>
            <Input
              id="planName"
              placeholder="e.g. Basic"
              value={displayName}
              onChange={({ target: { value } }) => setDisplayName(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planDescription">Description (optional)</Label>
            <Input
              id="planDescription"
              placeholder="e.g. A basic plan with essential features"
              value={description || ""}
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setDisplayName("")
              setDescription(null)
            }}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handleCreatePlan}
            disabled={!displayName || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
