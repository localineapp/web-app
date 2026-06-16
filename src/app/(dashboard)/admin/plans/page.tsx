import { getPlans } from "@/actions/plans"
import CreatePlanDialog from "@/components/dashboard/admin/plans/CreatePlanDialog"
import PlanPresetsDialog from "@/components/dashboard/admin/plans/PlanPresetsDialog"
import PlansTable from "@/components/dashboard/admin/plans/PlansTable"

export default async function AdminPlansPage() {
  const plans = await getPlans()
  const existsDefaultPlan = plans.some((plan) => plan.default)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground">
            View and manage all plans in the system.
          </p>
        </div>

        <div className="flex gap-2">
          <PlanPresetsDialog plans={plans} />
          <CreatePlanDialog />
        </div>
      </div>

      <div>
        <PlansTable plans={plans} existsDefaultPlan={existsDefaultPlan} />
      </div>
    </div>
  )
}
