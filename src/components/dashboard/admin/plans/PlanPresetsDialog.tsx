"use client"

import { createPlans } from "@/actions/plans"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import { Plan } from "@prisma/client"
import { ImportIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type ImportablePlanProps = {
  displayName: string
  description?: string
  localesLimit?: number
  termsLimit?: number
  labelsLimit?: number
  membersLimit?: number
}

const IMPORTABLE_PLANS: ImportablePlanProps[] = [
  {
    displayName: "Basic",
    description: "A basic plan with limited features.",
    localesLimit: 5,
    termsLimit: 500,
    labelsLimit: 20,
    membersLimit: 5,
  },
  {
    displayName: "Pro",
    description: "A pro plan with more features and higher limits.",
    localesLimit: 20,
    termsLimit: 5000,
    labelsLimit: 50,
    membersLimit: 50,
  },
  {
    displayName: "Enterprise",
    description: "An enterprise plan with all features and the highest limits.",
    localesLimit: 100,
    termsLimit: 50000,
    labelsLimit: 150,
    membersLimit: 300,
  },
  {
    displayName: "Unlimited",
    description: "A plan with unlimited features and limits.",
  },
]

export default function PlanPresetsDialog({
  plans,
  canCreatePlans,
}: {
  plans: Plan[]
  canCreatePlans: boolean
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedPlans, setSelectedPlans] = useState<ImportablePlanProps[]>([])

  const isPlanAlreadyImported = (plan: ImportablePlanProps) => {
    return plans.some(
      (existingPlan) => existingPlan.displayName === plan.displayName
    )
  }

  const allPlansAlreadyImported = IMPORTABLE_PLANS.every(isPlanAlreadyImported)

  const togglePlan = (plan: ImportablePlanProps) => {
    setSelectedPlans((prev) =>
      prev.includes(plan)
        ? prev.filter((selectedPlan) => selectedPlan !== plan)
        : [...prev, plan]
    )
  }

  const handleImportPlans = async () => {
    setLoading(true)

    try {
      const result = await createPlans(
        selectedPlans
          .sort((a, b) => {
            const aLimit = a.termsLimit ?? Infinity
            const bLimit = b.termsLimit ?? Infinity

            return aLimit - bLimit
          })
          .map((plan) => ({
            displayName: plan.displayName,
            description: plan.description,
            localesLimit: plan.localesLimit,
            termsLimit: plan.termsLimit,
            labelsLimit: plan.labelsLimit,
            membersLimit: plan.membersLimit,
          }))
      )

      toast.success(
        `Imported ${selectedPlans.length} locales (${result.count} created, ${selectedPlans.length - result.count} skipped).`
      )
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import plans. Please try again."
      )
    } finally {
      setLoading(false)
      setDialogOpen(false)
      setSelectedPlans([])
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setSelectedPlans([])
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            !canCreatePlans || allPlansAlreadyImported || loading
              ? "cursor-not-allowed"
              : ""
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canCreatePlans || allPlansAlreadyImported || loading}
            >
              <Button
                variant="outline"
                disabled={!canCreatePlans || allPlansAlreadyImported || loading}
              >
                <ImportIcon className="mr-2 h-4 w-4" />
                Presets
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreatePlans ? (
          <TooltipContent>
            You don&rsquo;t have permission to create new plans.
          </TooltipContent>
        ) : allPlansAlreadyImported ? (
          <TooltipContent>
            All plan presets have already been imported.
          </TooltipContent>
        ) : null}
      </Tooltip>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan Presets</DialogTitle>
          <DialogDescription>
            Select which presets you want to import into your system.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {IMPORTABLE_PLANS.map((plan) => (
            <Card
              key={plan.displayName}
              role="button"
              tabIndex={0}
              aria-disabled={isPlanAlreadyImported(plan) || loading}
              aria-pressed={selectedPlans.includes(plan)}
              onClick={() => {
                if (isPlanAlreadyImported(plan) || loading) return
                togglePlan(plan)
              }}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                selectedPlans.includes(plan) && "bg-primary/5",
                isPlanAlreadyImported(plan) &&
                  "cursor-not-allowed opacity-50 hover:bg-transparent"
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.displayName}</span>
                  {selectedPlans.includes(plan) && (
                    <Badge variant="outline">Selected</Badge>
                  )}
                  {isPlanAlreadyImported(plan) && (
                    <Badge variant="destructive">Already Imported</Badge>
                  )}
                </CardTitle>
                <CardDescription className={cn(!plan.description && "italic")}>
                  {plan.description ?? "No description available."}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-1">
                  <li>
                    <strong>Locales Limit:</strong>{" "}
                    {plan.localesLimit !== undefined
                      ? plan.localesLimit.toLocaleString("en-US")
                      : "∞"}
                  </li>

                  <li>
                    <strong>Terms Limit:</strong>{" "}
                    {plan.termsLimit !== undefined
                      ? plan.termsLimit.toLocaleString("en-US")
                      : "∞"}
                  </li>

                  <li>
                    <strong>Labels Limit:</strong>{" "}
                    {plan.labelsLimit !== undefined
                      ? plan.labelsLimit.toLocaleString("en-US")
                      : "∞"}
                  </li>

                  <li>
                    <strong>Members Limit:</strong>{" "}
                    {plan.membersLimit !== undefined
                      ? plan.membersLimit.toLocaleString("en-US")
                      : "∞"}
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setSelectedPlans([])
            }}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handleImportPlans}
            disabled={loading || selectedPlans.length === 0}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Importing...
              </>
            ) : (
              <>
                <ImportIcon className="h-4 w-4" />
                Import Presets ({selectedPlans.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
