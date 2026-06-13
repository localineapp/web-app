"use client"

import { addPassword } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { authClient, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  KeySquareIcon,
  LockKeyholeIcon,
  MailIcon,
  PencilIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function SecurityDetailsCard({
  session,
  hasPassword,
}: {
  session: ReturnType<typeof useSession>["data"]
  hasPassword: boolean
}) {
  const router = useRouter()

  const user = session?.user

  const [loading, setLoading] = useState(false)
  const [isEmailVisible, setEmailVisible] = useState(false)
  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false)

  const [email, setEmail] = useState(user?.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("") // Used for both new password and confirm new password when the user doesn't have a password yet
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const handleUpdateEmail = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.changeEmail({
      newEmail: email.trim(),
      callbackURL: `${window.location.origin}/account/security`,
      fetchOptions: {
        onSuccess: () => {
          // TODO: Add a check if it got directly updated or if the user needs to confirm via email first and show a different message accordingly
          toast.success("Your email has been successfully updated.")
          setEmailDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || "Failed to update your email. Please try again."
          )
          setEmailDialogOpen(false)
          setLoading(false)

          setEmail(user?.email ?? "")
        },
      },
    })
  }

  const handleUpdatePassword = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.changePassword({
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
      revokeOtherSessions: true,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Your password has been successfully updated.")
          setPasswordDialogOpen(false)
          setLoading(false)

          setCurrentPassword("")
          setNewPassword("")
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              "Failed to update your password. Please try again."
          )
          setPasswordDialogOpen(false)
          setLoading(false)

          setCurrentPassword("")
          setNewPassword("")
        },
      },
    })
  }

  const handleAddPassword = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    if (newPassword.trim() !== confirmNewPassword.trim()) {
      toast.error("The new password and confirm password fields do not match.")
      setLoading(false)
      return
    }

    await addPassword(newPassword.trim())
      .then(() => {
        toast.success("Password has been successfully added to your account.")

        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            "Failed to add a password to your account. Please try again."
        )
      })
      .finally(() => {
        setPasswordDialogOpen(false)
        setLoading(false)
        setNewPassword("")
        setConfirmNewPassword("")
      })
  }

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <MailIcon className="size-4" />
          <p>Email:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            className="relative inline-flex h-6 min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden rounded-md px-2 py-1 text-left transition hover:bg-muted/50"
            aria-pressed={isEmailVisible}
            onClick={() => {
              setEmailVisible((current) => !current)
            }}
          >
            <span
              className={cn(
                "min-w-0 font-mono text-sm break-all transition",
                isEmailVisible
                  ? "text-foreground"
                  : "text-foreground/40 blur-sm select-none"
              )}
            >
              {user?.email ?? "Unknown"}
            </span>

            <span className="shrink-0 text-muted-foreground">
              {isEmailVisible ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeOffIcon className="size-4" />
              )}
            </span>

            {!isEmailVisible ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-md bg-muted/55 shadow-inner shadow-black/20"
              />
            ) : null}
          </Button>
          <Dialog open={isEmailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="shrink-0">
                <PencilIcon className="size-4" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit email</DialogTitle>
                <DialogDescription>
                  Update the email address associated with your account.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  disabled={loading}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailDialogOpen(false)
                    setEmail(user?.email ?? "")
                  }}
                  disabled={loading}
                >
                  Close
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUpdateEmail}
                  disabled={
                    !email.trim() ||
                    email.trim() === user?.email?.trim() ||
                    loading
                  }
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

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <KeySquareIcon className="size-4" />
          <p>Password:</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {hasPassword ? (
            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Change password</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                  <DialogDescription>
                    Update your account password. Make sure to choose a strong
                    and unique password to enhance the security of your account.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      placeholder="Enter your current password"
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setCurrentPassword(value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      placeholder="Enter your new password"
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setNewPassword(value)
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordDialogOpen(false)
                      setCurrentPassword("")
                      setNewPassword("")
                    }}
                    disabled={loading}
                  >
                    Close
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleUpdatePassword}
                    disabled={
                      !newPassword.trim() ||
                      currentPassword.trim() === newPassword.trim() ||
                      loading
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Changing password...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        Change password
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Add password</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add password</DialogTitle>
                  <DialogDescription>
                    Your account is currently using a passwordless
                    authentication method. To add a password, please enter a new
                    password below.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      placeholder="Enter your new password"
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setNewPassword(value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPasswordConfirm">Confirm password</Label>
                    <Input
                      id="newPasswordConfirm"
                      type="password"
                      value={confirmNewPassword}
                      placeholder="Confirm your new password"
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setConfirmNewPassword(value)
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordDialogOpen(false)
                      setNewPassword("")
                      setConfirmNewPassword("")
                    }}
                    disabled={loading}
                  >
                    Close
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAddPassword}
                    disabled={
                      !newPassword.trim() ||
                      newPassword.trim() !== confirmNewPassword.trim() ||
                      loading
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Adding password...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        Add password
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <LockKeyholeIcon className="size-4" />
          <p>2FA:</p>

          <span className="rounded-md bg-muted px-1 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {false ? (
            <Button variant="outline">Manage 2FA</Button>
          ) : (
            <Button variant="outline" disabled>
              Setup 2FA
            </Button>
          )}
        </div>
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <FingerprintIcon className="size-4" />
          <p>Passkey:</p>

          <span className="rounded-md bg-muted px-1 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {false ? (
            <Button variant="outline">Manage Passkey</Button>
          ) : (
            <Button variant="outline" disabled>
              Setup Passkey
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
