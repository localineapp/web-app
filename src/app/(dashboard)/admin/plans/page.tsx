import { getPlans } from "@/actions/plans"
import CreatePlanDialog from "@/components/dashboard/admin/plans/CreatePlanDialog"
import PlanPresetsDialog from "@/components/dashboard/admin/plans/PlanPresetsDialog"
import PlansTable from "@/components/dashboard/admin/plans/PlansTable"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function AdminPlansPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const plans = await getPlans()

  const user = session?.user

  const canCreatePlans = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: user.role ?? "user",
        permissions: {
          plans: ["create"],
        },
      },
    })
  ).success

  const canUpdatePlans = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: user.role ?? "user",
        permissions: {
          plans: ["update"],
        },
      },
    })
  ).success

  const canDeletePlans = (
    await auth.api.userHasPermission({
      body: {
        // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
        role: user.role ?? "user",
        permissions: {
          plans: ["delete"],
        },
      },
    })
  ).success

  const existsDefaultPlan =
    plans.length !== 0 && plans.some((plan) => plan.default)

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
          <PlanPresetsDialog plans={plans} canCreatePlans={canCreatePlans} />
          <CreatePlanDialog canCreatePlans={canCreatePlans} />
        </div>
      </div>

      <div>
        <PlansTable
          plans={plans}
          canCreatePlans={canCreatePlans}
          canUpdatePlans={canUpdatePlans}
          canDeletePlans={canDeletePlans}
          existsDefaultPlan={existsDefaultPlan}
        />
      </div>
    </div>
  )
}
