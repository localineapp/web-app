"use server"

export function areSignUpsDisabled(): boolean {
  const signUpsDisabled = process.env.DISABLE_SIGNUP === "true";
  return signUpsDisabled;
}

export function isAnySocialLoginEnabled(): boolean {
  const googleEnabled = isGoogleLoginEnabled();
  const githubEnabled = isGitHubLoginEnabled();
  const discordEnabled = isDiscordLoginEnabled();
  return discordEnabled || googleEnabled || githubEnabled;
}

export function isDiscordLoginEnabled(): boolean {
  const discordLoginEnabled = process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET;
  return !!discordLoginEnabled;
}

export function isGoogleLoginEnabled(): boolean {
  const googleLoginEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  return !!googleLoginEnabled;
}

export function isGitHubLoginEnabled(): boolean {
  const githubLoginEnabled = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
  return !!githubLoginEnabled;
}