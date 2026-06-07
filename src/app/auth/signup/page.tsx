import {
  areSignUpsDisabled,
  isGoogleLoginEnabled,
  isGitHubLoginEnabled,
  isDiscordLoginEnabled,
} from "@/actions/get-env"
import SignUpForm from "@/components/auth/form/SignUpForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
}

export default async function SignUpPage() {
  const [googleEnabled, githubEnabled, discordEnabled, signUpsDisabled] =
    await Promise.all([
      isGoogleLoginEnabled(),
      isGitHubLoginEnabled(),
      isDiscordLoginEnabled(),
      areSignUpsDisabled(),
    ])

  const showSocialButtons = googleEnabled || githubEnabled || discordEnabled

  return (
    <SignUpForm
      showSocialButtons={showSocialButtons}
      signUpsDisabled={signUpsDisabled}
      googleEnabled={googleEnabled}
      githubEnabled={githubEnabled}
      discordEnabled={discordEnabled}
    />
  )
}
