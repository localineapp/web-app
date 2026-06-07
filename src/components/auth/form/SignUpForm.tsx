"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { SubmitEvent, useState } from "react"
import SocialAuthButtons from "@/components/auth/SocialAuthButtons"
import { signUp } from "@/lib/auth-client"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

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

export default function SignUpForm({
  showSocialButtons,
  signUpsDisabled,
  googleEnabled,
  githubEnabled,
  discordEnabled,
}: {
  showSocialButtons?: boolean
  signUpsDisabled?: boolean
  googleEnabled?: boolean
  githubEnabled?: boolean
  discordEnabled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (signUpsDisabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <AlertCircleIcon className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-3xl font-semibold">Sign Up Disabled</h2>
        </div>
        <p className="mx-auto max-w-lg text-center text-lg text-muted-foreground">
          The administrator of this instance has disabled new account
          registrations. Please contact your administrator for more information.
        </p>
        <div className="relative inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <GoBackButton />
      </div>
    )
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    await signUp.email({
      callbackURL: "/",
      name,
      email,
      password,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            "Account created successfully. Please check your email to verify your account."
          )
          redirect("/")
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              "Unable to create account. Please check your credentials."
          )
          setLoading(false)
        },
      },
    })
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-bold">Create your account</h1>
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
            onChange={({ target: { value } }) => setName(value)}
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
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="password">Password</Label>
          <InputGroup>
            <InputGroupInput
              id="password"
              placeholder="Enter your password"
              type={showPassword && !loading ? "text" : "password"}
              required
              value={password}
              disabled={loading}
              onChange={({ target: { value } }) => setPassword(value)}
            />

            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>

            <InputGroupAddon align="inline-end">
              <Button
                disabled={loading}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button
          className="w-full disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
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
              discordEnabled={discordEnabled}
            />
          </div>
        </>
      )}

      <GoBackButton />
    </>
  )
}
