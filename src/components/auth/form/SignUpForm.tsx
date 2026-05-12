"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import Link from "next/link"
import { SubmitEvent, useState } from "react"
import SocialAuthButtons from "@/components/auth/social-auth-buttons"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { redirect } from "next/navigation"

function GoBackButton() {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      <Link href="/auth/signin" className="text-primary underline">
        Sign in
      </Link>
    </p>
  )
}

export default function SignUpForm({ showSocialButtons, signUpsDisabled, googleEnabled, githubEnabled, discordEnabled }: { showSocialButtons?: boolean, signUpsDisabled?: boolean, googleEnabled?: boolean, githubEnabled?: boolean, discordEnabled?: boolean }) {
  if (signUpsDisabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-3xl font-semibold">Sign Up Disabled</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto text-center">
          The administrator of this instance has disabled new account registrations.
          Please contact your administrator for more information.
        </p>
        <div className="relative inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <GoBackButton />
      </div>
    )
  }

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.signUp.email({
      callbackURL: "/",
      name,
      email,
      password,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Account created successfully. Please check your email to verify your account.")
          redirect("/")
        },
        onError(context) {
          toast.error(context.error?.message || "Unable to create account. Please check your credentials.")
          setLoading(false)
        },
      }
    })
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Welcome! Please enter your details to create an account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
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

        <Button className="w-full disabled:cursor-not-allowed" type="submit" disabled={loading}>
          {loading && (
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign up
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
                Or register with
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <SocialAuthButtons
              loading={loading}
              setLoading={setLoading}
              googleEnabled={googleEnabled}
              githubEnabled={githubEnabled}
              discordEnabled={discordEnabled} />
          </div>
        </>
      )}

      <GoBackButton />
    </>
  )
}