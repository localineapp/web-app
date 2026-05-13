"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Trash2Icon, TrashIcon } from "lucide-react"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export function RevokeOtherSessionsDialog() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleRevokeSessions = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.revokeOtherSessions({
      fetchOptions: {
        onSuccess: () => {
          toast.success("All sessions revoked except the current one.")
          setDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError() {
          toast.error("Failed to revoke sessions.")
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <TrashIcon className="mr-2 h-4 w-4" />
          Revoke Other Sessions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke Other Sessions</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke all other active sessions?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevokeSessions}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Revoking Sessions...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                Revoke Sessions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RevokeAllSessionsDialog() {
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const handleRevokeSessions = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.revokeSessions({
      fetchOptions: {
        onSuccess: () => {
          toast.success("All sessions revoked.")
          setDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError() {
          toast.error("Failed to revoke sessions.")
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2Icon className="mr-2 h-4 w-4" />
            Revoke All Sessions
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke all active sessions, including the current one.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeSessions}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Revoking Sessions...
                </>
              ) : (
                <>
                  <Trash2Icon className="h-4 w-4" />
                  Revoke Sessions
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
