"use client"

import { useSession } from "@/components/session-provider"
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
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { ClipboardIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateApiKeyDialog({
  apiKeysCount,
  apiKeysLimit,
}: {
  apiKeysCount: number
  apiKeysLimit: number
}) {
  const router = useRouter()
  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [disableRateLimiting, setDisableRateLimiting] = useState(false)

  const [apiKey, setApiKey] = useState("")

  const hasUnlimitedApiKeys = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      apiKeys: ["unlimited"],
    },
  })

  const canDisableRateLimiting = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      apiKeys: ["no-rate-limit"],
    },
  })

  const userApiKeysLimit = hasUnlimitedApiKeys ? Infinity : apiKeysLimit
  const canCreateApiKey = apiKeysCount < userApiKeysLimit

  const handleCreateApiKey = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    if (!canCreateApiKey) {
      toast.error(
        userApiKeysLimit === 0
          ? "The API key limit for your account is currently set to 0."
          : `You have reached your API key limit (${apiKeysCount}/${userApiKeysLimit})`
      )
      setLoading(false)
      setName("")
      setExpiryDate(undefined)
      return
    }

    await authClient.apiKey.create({
      configId: disableRateLimiting ? "no-rate-limit" : "default",
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
    <Dialog open={isDialogOpen || !!apiKey} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canCreateApiKey || loading ? "cursor-not-allowed" : ""}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateApiKey || loading}>
              <Button variant="outline" disabled={!canCreateApiKey || loading}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New API Key
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateApiKey && (
          <TooltipContent>
            {userApiKeysLimit === 0
              ? "The administrator of this system has set the API key limit to 0."
              : `You have reached your API key limit (${apiKeysCount}/${userApiKeysLimit})`}
          </TooltipContent>
        )}
      </Tooltip>

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

                  router.refresh()
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

              {canDisableRateLimiting && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="disableRateLimiting"
                    checked={disableRateLimiting}
                    onCheckedChange={setDisableRateLimiting}
                    disabled={loading}
                  />
                  <Label htmlFor="disableRateLimiting">
                    Disable Rate Limiting
                    <span className="text-xs text-muted-foreground">
                      (Admin only)
                    </span>
                  </Label>
                </div>
              )}
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
                Close
              </Button>

              <Button
                variant="outline"
                onClick={handleCreateApiKey}
                disabled={
                  !name ||
                  // eslint-disable-next-line react-hooks/purity
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
