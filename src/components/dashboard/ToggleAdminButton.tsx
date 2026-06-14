"use client"

import { setRole } from "@/actions/development"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { AlertTriangleIcon, CrownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ToggleAdminButton({
  user,
}: {
  user: NonNullable<ReturnType<typeof useSession>["data"]>["user"]
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handleGrantAdminAccess = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    if (!user) return

    setLoading(true)
    await setRole(user.id, user.role === "admin" ? "user" : "admin")
      .then(() => {
        toast.success(
          `${user.role === "admin" ? "Revoked" : "Granted"} admin access successfully.`
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to update admin access. Please try again."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="destructive"
          disabled={loading}
          onClick={handleGrantAdminAccess}
        >
          <CrownIcon className="mr-1 h-4 w-4" />
          {user?.role === "admin"
            ? "Revoke Admin Access"
            : "Grant Admin Access"}
        </Button>
      </TooltipTrigger>

      <TooltipContent className="flex items-center gap-2">
        <AlertTriangleIcon className="size-4 shrink-0 text-red-500 dark:text-red-400" />
        <span>
          If you see this button in your production environment, you forgot to
          set your NODE_ENV to production. Please set it to avoid security
          risks.
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
