"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { SubmitEvent, useState } from "react"
import SocialAuthButtons from "@/components/auth/social-auth-buttons"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { redirect } from "next/navigation"

export default function SignInForm({ showSocialButtons, signUpsDisabled }: { showSocialButtons?: boolean, signUpsDisabled?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    await authClient.signIn.email({
      email,
      password,
      rememberMe,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed in successfully")
          redirect("/")
        },
        onError(context) {
          toast.error(context.error?.message || "Unable to sign in. Please check your credentials.")
          setLoading(false)
        },
      },
    })
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Sign into your account</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Please enter your details to sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="password"
              placeholder="Enter your password"
              type={(showPassword && !loading) ? "text" : "password"}
              required
              value={password}
              disabled={loading}
              className="pl-10 pr-10"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(val) => setRememberMe(Boolean(val))}
            disabled={loading}
          />
          <Label htmlFor="rememberMe" className="text-sm">
            Remember me
          </Label>
        </div>

        <Button className="w-full disabled:cursor-not-allowed" type="submit" disabled={loading}>
          {loading && (
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign in
        </Button>
      </form>

      {showSocialButtons && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <SocialAuthButtons />
          </div>
        </>
      )}

      {!signUpsDisabled && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary underline">
            Sign up
          </Link>
        </p>
      )}
    </>
  )
}