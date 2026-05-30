import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FullProject } from "@/types/project"
import {
  ClockAlertIcon,
  GlobeIcon,
  LibraryIcon,
  PercentIcon,
  UsersIcon,
} from "lucide-react"

export default function StatisticCards({ project }: { project: FullProject }) {
  const terms = project?.terms
  const locales = project?.locales
  const members = project?.members
  const plan = project?.plan

  const totalTranslations =
    terms?.reduce((acc, term) => acc + term.translations.length, 0) ?? 0
  const translatedCount =
    terms?.reduce(
      (acc, term) => acc + term.translations.filter((t) => t.value).length,
      0
    ) ?? 0
  const progress =
    totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Translation Progress
          </CardTitle>
          <PercentIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {totalTranslations === 0 ? (
            <p className="text-muted-foreground italic">
              No translations available.
            </p>
          ) : (
            <>
              <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
              <Progress value={progress} className="mt-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {translatedCount?.toLocaleString("en-US")} of{" "}
                {totalTranslations?.toLocaleString("en-US")} translations
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Terms</CardTitle>
          <LibraryIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {terms?.length === 0 ? (
            <p className="text-muted-foreground italic">No terms available.</p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">
                  {terms?.length?.toLocaleString("en-US")}
                </div>
                <div className="h-2">
                  /{plan?.termsLimit?.toLocaleString("en-US") ?? "∞"}
                </div>
                {plan?.termsLimit && terms?.length >= plan?.termsLimit && (
                  <LimitReachedBadge />
                )}
              </div>
              <p>terms have been added to this project.</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Locales</CardTitle>
          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {locales?.length === 0 ? (
            <p className="text-muted-foreground italic">
              No locales available.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">
                  {locales?.length?.toLocaleString("en-US")}
                </div>
                <div className="h-2">
                  /{plan?.localesLimit?.toLocaleString("en-US") ?? "∞"}
                </div>
                {plan?.localesLimit &&
                  locales?.length >= plan?.localesLimit && (
                    <LimitReachedBadge />
                  )}
              </div>
              <p>locales have been added to this project.</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Members</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {members?.length === 0 ? (
            <p className="text-muted-foreground italic">
              No members available.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">
                  {members?.length?.toLocaleString("en-US")}
                </div>
                <div className="h-2">
                  /{plan?.membersLimit?.toLocaleString("en-US") ?? "∞"}
                </div>
                {plan?.membersLimit &&
                  members?.length >= plan?.membersLimit && (
                    <LimitReachedBadge />
                  )}
              </div>
              <p>
                member{members?.length !== 1 ? "s are" : " is"} contributing to
                this project.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function LimitReachedBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded bg-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
      <ClockAlertIcon className="mr-1 h-3 w-3" />
      Limit reached
    </span>
  )
}
