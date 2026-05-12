import { APIError, betterAuth } from "better-auth";
import { admin as adminPlugin, lastLoginMethod } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { ac, admin, user } from "@/lib/permission";

const signUpDisabled = process.env.DISABLE_SIGNUP === "true";

export const auth = betterAuth({
  appName: "Localine",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: signUpDisabled,
    requireEmailVerification: false,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    lastLoginMethod({ storeInDatabase: true })
  ],
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false, // TODO: should be true if no email service is configured
    },
    deleteUser: {
      enabled: true,
    },
  },
  account: {
    updateAccountOnSignIn: true,
    accountLinking: {
      disableImplicitLinking: true,
    },
    encryptOAuthTokens: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (_, ctx) => {
          if (signUpDisabled && ctx?.path != "/admin/create-user") {
            throw new APIError("BAD_REQUEST", {
              message: "signup is disabled",
            });
          }
        },
      },
    },
  }
});
