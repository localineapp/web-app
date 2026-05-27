import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/lib/auth-client"
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { FullProject } from "@/types/project"
import { ProjectMemberRole } from "@prisma/client"
import { CalendarIcon, FlagIcon, Globe2Icon, TagIcon } from "lucide-react"

export default function MemberInfoCards({
  session,
  project,
}: {
  session: ReturnType<typeof useSession>["data"]
  project: FullProject
}) {
  const member = project.members.find((m) => m.userId === session?.user.id)
  const isMember = !!member

  return (
    <>
      <RoleCard role={member?.role} isMember={isMember} />
      <LocalesCard locales={member?.locales ?? []} isMember={isMember} />
      <JoinedAtCard joinedAt={member?.createdAt} isMember={isMember} />
    </>
  )
}

function RoleCard({
  role,
  isMember,
}: {
  role: ProjectMemberRole | undefined
  isMember: boolean
}) {
  const roleColor = role?.color
  const colorStyle = getColorStyle(roleColor)
  const colorClassName = getColorClassName(roleColor)
  const RoleIcon = getIcon(role?.icon)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Your Role</CardTitle>
        <TagIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        {!isMember ? (
          <p className="text-muted-foreground italic">
            You don&rsquo;t have a role in this project. (Admin)
          </p>
        ) : (
          <div
            className={`inline-flex items-center gap-2 text-2xl leading-none font-medium ${colorClassName}`}
            style={colorStyle}
          >
            {RoleIcon ? (
              <RoleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : null}
            {role?.name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LocalesCard({
  locales,
  isMember,
}: {
  locales: FullProject["members"][number]["locales"]
  isMember: boolean
}) {
  const hasLocales = locales.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Assigned Locales</CardTitle>

        <div className="flex items-center gap-1">
          {hasLocales ?? (
            <span className="mr-1 text-sm">{locales?.length ?? 0}</span>
          )}

          <Globe2Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        {!isMember ? (
          <p className="text-muted-foreground italic">
            You can manage all locales in this project. (Admin)
          </p>
        ) : !hasLocales ? (
          <p className="text-muted-foreground italic">
            You can manage all locales in this project.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {locales.map(({ locale: { id, displayName } }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-1 text-sm font-medium"
              >
                <FlagIcon className="h-3 w-3 text-muted-foreground" />
                {displayName}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function JoinedAtCard({
  joinedAt,
  isMember,
}: {
  joinedAt: Date | undefined
  isMember: boolean
}) {
  const date = new Date(joinedAt ?? "").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Joined At</CardTitle>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        {!isMember ? (
          <p className="text-muted-foreground italic">
            You haven&rsquo;t joined this project.
          </p>
        ) : (
          <div className="text-2xl font-medium">{date}</div>
        )}
      </CardContent>
    </Card>
  )
}
