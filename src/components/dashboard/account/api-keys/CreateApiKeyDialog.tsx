"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { authClient, useSession } from "@/lib/auth-client"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateApiKeyDialog({
  session,
}: {
  session: ReturnType<typeof useSession>["data"]
}) {
  const router = useRouter()

  const user = session?.user

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)

  const handleCreateApiKey = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.apiKey.create({
      name,
      expiresIn: expiryDate ?
        Math.floor((expiryDate.getTime() - Date.now()) / 1000) :
        undefined,
      fetchOptions: {
        onSuccess: () => {
          toast.success("API key created successfully!")
          setLoading(false)
          setDialogOpen(false)
          setName("")
          setExpiryDate(null)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to create API key. Please try again."
          )
          setLoading(false)
          setDialogOpen(false)
          setName("")
          setExpiryDate(null)
        },
      },
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        disabled={loading}
      >
        <Button
          variant="outline"
          disabled={loading}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new API key</DialogTitle>
          <DialogDescription>
            Create a new API key to authenticate your applications.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setName("")
              setExpiryDate(null)
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateApiKey}
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
                Create API Key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}