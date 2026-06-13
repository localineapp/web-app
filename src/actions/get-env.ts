"use server"

import { auth } from "@/lib/auth"

export async function isProduction(): Promise<boolean> {
  return process.env.NODE_ENV === "production"
}

export async function getAppName(): Promise<string> {
  return process.env.APP_NAME || "Localine"
}

export async function getVersion(): Promise<string> {
  const packageJson = await import("@/../package.json")
  return packageJson.default.version
}

export async function areSignUpsDisabled(): Promise<boolean> {
  const signUpsDisabled = process.env.DISABLE_SIGNUP === "true"
  return signUpsDisabled
}

export async function getApiKeysLimit(): Promise<number> {
  const fallbackLimit = 10
  const apiKeysLimit = process.env.API_KEYS_LIMIT
  return apiKeysLimit ? parseInt(apiKeysLimit, fallbackLimit) : fallbackLimit
}

export async function isEmailVerificationRequired(): Promise<boolean> {
  return auth.options.emailAndPassword.requireEmailVerification
}

export async function isAnySocialLoginEnabled(): Promise<boolean> {
  return await Promise.all([
    isGoogleLoginEnabled(),
    isGitHubLoginEnabled(),
    isDiscordLoginEnabled(),
  ]).then((results) => results.some((enabled) => enabled))
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
