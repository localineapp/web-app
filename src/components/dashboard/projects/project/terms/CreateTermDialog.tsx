"use client"

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
import { useSession } from "@/lib/auth-client"
import { FullProject } from "@/types/project"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"

export default function CreateTermDialog({
  session,
  project,
}: {
  session: ReturnType<typeof useSession>["data"]
  project: FullProject
}) {
  const router = useRouter()

  const user = session?.user

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [context, setContext] = useState<string | null>(null)

  const canCreateTerms = true // TODO: Determine if the user can create terms based on their membership role
  const isLimitReached =
    project.plan.termsLimit !== null &&
    project.terms.length >= project.plan.termsLimit

  const handleCreateTerm = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canCreateTerms && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canCreateTerms || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canCreateTerms || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Term
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {(!canCreateTerms || isLimitReached) && (
          <TooltipContent>
            {!canCreateTerms
              ? "You don't have permission to create terms in this project."
              : (isLimitReached ??
                "This project has reached the maximum number of terms allowed by your plan.")}
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new term</DialogTitle>
          <DialogDescription>Add a new term to your project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="termName">Term name</Label>
            <Input
              id="termName"
              placeholder="My Term"
              value={name}
              onChange={({ target: { value } }) => setName(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termContext">Context (optional)</Label>
            <Input
              id="termContext"
              placeholder="A brief context for your term"
              value={context ?? ""}
              onChange={({ target: { value } }) => setContext(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setName("")
              setContext(null)
            }}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateTerm}
            disabled={!name || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Term
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
