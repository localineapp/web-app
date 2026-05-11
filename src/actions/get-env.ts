"use server"

export async function areSignUpsDisabled(): Promise<boolean> {
  const signUpsDisabled = process.env.DISABLE_SIGNUP === "true";
  return signUpsDisabled;
}

export async function isAnySocialLoginEnabled(): Promise<boolean> {
  const [googleEnabled, githubEnabled, discordEnabled] = await Promise.all([
    isGoogleLoginEnabled(),
    isGitHubLoginEnabled(),
    isDiscordLoginEnabled(),
  ]);
  return discordEnabled || googleEnabled || githubEnabled;
}

export async function isDiscordLoginEnabled(): Promise<boolean> {
  const discordLoginEnabled = process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET;
  return !!discordLoginEnabled;
}

export async function isGoogleLoginEnabled(): Promise<boolean> {
  const googleLoginEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  return !!googleLoginEnabled;
}

export async function isGitHubLoginEnabled(): Promise<boolean> {
  const githubLoginEnabled = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
  return !!githubLoginEnabled;
}