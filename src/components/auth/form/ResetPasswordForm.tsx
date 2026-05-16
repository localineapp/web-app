"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { redirect, useSearchParams } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <AlertCircleIcon className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-3xl font-semibold">Invalid Token</h2>
        </div>
        <p className="mx-auto max-w-lg text-center text-lg text-muted-foreground">
          The password reset link is invalid. Please make sure you copied the
          entire link from your email and try again.
        </p>
        <div className="relative inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Forgot your password?{" "}
          <Link href="/auth/forgot-password" className="text-primary underline">
            Reset it
          </Link>
        </p>
      </div>
    )
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.resetPassword({
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            "Password reset successfully. You can now sign in with your new password."
          )
          redirect("/auth/signin")
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              "Unable to reset password. The reset link may be invalid or expired."
          )
          setLoading(false)
        },
      },
      newPassword: password,
      token,
    })
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1">
          <Label htmlFor="password">Password</Label>

          <div className="relative">
            <LockIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="password"
              placeholder="Enter your password"
              type={showPassword && !loading ? "text" : "password"}
              required
              value={password}
              disabled={loading}
              className="pr-10 pl-10"
              onChange={({ target: { value } }) => setPassword(value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          className="w-full disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </>
  )
}
