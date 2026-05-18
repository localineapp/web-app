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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { authClient, useSession } from "@/lib/auth-client"
import { ClipboardIcon, PlusIcon } from "lucide-react"
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
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)

  const [apiKey, setApiKey] = useState("")

  const handleCreateApiKey = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.apiKey.create({
      name,
      expiresIn: expiryDate
        ? Math.floor((expiryDate.getTime() - Date.now()) / 1000)
        : undefined,
      fetchOptions: {
        onSuccess: ({ data: { key } }) => {
          toast.success("API key created successfully!")
          setLoading(false)
          setName("")
          setExpiryDate(undefined)

          setApiKey(key)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to create API key. Please try again."
          )
          setLoading(false)
          setDialogOpen(false)
          setName("")
          setExpiryDate(undefined)
        },
      },
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={loading}>
        <Button variant="outline" disabled={loading}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        {apiKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Your new API key has been created successfully. Please copy and
                store it securely, as it will not be shown again.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <InputGroup>
                  <InputGroupInput value={apiKey} readOnly />
                  <InputGroupAddon align="inline-end">
                    <ClipboardIcon
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey)
                        toast.success("API key copied to clipboard!")
                      }}
                    />
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setDialogOpen(false)
                  setApiKey("")
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create new API key</DialogTitle>
              <DialogDescription>
                Create a new API key to authenticate your applications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="apiKeyName">Key Name</Label>
                <Input
                  id="apiKeyName"
                  placeholder="My API Key"
                  value={name}
                  onChange={({ target: { value } }) => setName(value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={
                    expiryDate ? expiryDate.toISOString().split("T")[0] : ""
                  }
                  onChange={({ target: { value } }) =>
                    setExpiryDate(value ? new Date(value) : undefined)
                  }
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setName("")
                  setExpiryDate(undefined)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateApiKey}
                disabled={
                  !name ||
                  (expiryDate && expiryDate.getTime() <= Date.now()) ||
                  loading
                }
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
