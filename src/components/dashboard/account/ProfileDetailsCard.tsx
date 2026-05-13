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
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { authClient, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  PencilIcon,
  TagIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function ProfileDetailsCard({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  const router = useRouter()

  const user = session?.user

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [isEmailVisible, setEmailVisible] = useState(false)

  const handleUpdateName = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.updateUser({
      name: name.trim(),
      fetchOptions: {
        onSuccess: () => {
          toast.success("Your name has been successfully updated.")
          setDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError() {
          toast.error("Failed to update your name.")
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TagIcon className="size-4" />
          <p>Name:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 break-all font-mono text-sm text-foreground">
            {user?.name ?? "Unknown"}
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="shrink-0">
                <PencilIcon className="size-4" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit name</DialogTitle>
                <DialogDescription>
                  Update the public name shown on your profile.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  placeholder="Enter your name"
                  disabled={loading}
                  autoFocus
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUpdateName}
                  disabled={!name.trim() || name.trim() === user?.name?.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <MailIcon className="size-4" />
          <p>Email:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="relative inline-flex min-w-0 flex-1 h-6 items-center justify-between gap-2 overflow-hidden rounded-md px-2 py-1 text-left transition hover:bg-muted/50"
            aria-pressed={isEmailVisible}
            onClick={() => {
              setEmailVisible((current) => !current)
            }}>
            <span
              className={cn(
                "min-w-0 break-all font-mono text-sm transition",
                isEmailVisible ?
                  "text-foreground" :
                  "select-none text-foreground/40 blur-sm"
              )}
            >
              {user?.email ?? "Unknown"}
            </span>

            <span className="shrink-0 text-muted-foreground">
              {isEmailVisible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
            </span>

            {!isEmailVisible ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-md bg-muted/55 shadow-inner shadow-black/20"
              />
            ) : null}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}