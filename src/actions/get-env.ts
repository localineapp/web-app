"use server"

import { auth } from "@/lib/auth"

export async function areSignUpsDisabled(): Promise<boolean> {
  const signUpsDisabled = process.env.DISABLE_SIGNUP === "true"
  return signUpsDisabled
}

export async function isAnySocialLoginEnabled(): Promise<boolean> {
  const [googleEnabled, githubEnabled, discordEnabled] = await Promise.all([
    isGoogleLoginEnabled(),
    isGitHubLoginEnabled(),
    isDiscordLoginEnabled(),
  ])
  return discordEnabled || googleEnabled || githubEnabled
}

export async function isDiscordLoginEnabled(): Promise<boolean> {
  return auth.options.socialProviders.discord.enabled
}

export async function isGoogleLoginEnabled(): Promise<boolean> {
  return auth.options.socialProviders.google.enabled
}

export async function isGitHubLoginEnabled(): Promise<boolean> {
  return auth.options.socialProviders.github.enabled
}
