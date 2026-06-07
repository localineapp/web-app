import {
  areSignUpsDisabled,
  isGoogleLoginEnabled,
  isGitHubLoginEnabled,
  isDiscordLoginEnabled,
} from "@/actions/get-env"
import SignInForm from "@/components/auth/form/SignInForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
}

export default async function SignInPage() {
  const [googleEnabled, githubEnabled, discordEnabled, signUpsDisabled] =
    await Promise.all([
      isGoogleLoginEnabled(),
      isGitHubLoginEnabled(),
      isDiscordLoginEnabled(),
      areSignUpsDisabled(),
    ])

  const showSocialButtons = googleEnabled || githubEnabled || discordEnabled

  return (
    <SignInForm
      showSocialButtons={showSocialButtons}
      signUpsDisabled={signUpsDisabled}
      googleEnabled={googleEnabled}
      githubEnabled={githubEnabled}
      discordEnabled={discordEnabled}
    />
  )
}
