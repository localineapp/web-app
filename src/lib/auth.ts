import { APIError, betterAuth } from "better-auth"
import {
  admin as adminPlugin,
  lastLoginMethod,
  openAPI,
} from "better-auth/plugins"
import { apiKey } from "@better-auth/api-key"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { ac, admin, user } from "@/lib/permission"

const signUpDisabled = process.env.DISABLE_SIGNUP === "true"

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
    requireEmailVerification: false, // TODO: should be true if email service is configured
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    discord: {
      enabled:
        !!process.env.DISCORD_CLIENT_ID! &&
        !!process.env.DISCORD_CLIENT_SECRET!,
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    github: {
      enabled:
        !!process.env.GITHUB_CLIENT_ID! && !!process.env.GITHUB_CLIENT_SECRET!,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      enabled:
        !!process.env.GOOGLE_CLIENT_ID! && !!process.env.GOOGLE_CLIENT_SECRET!,
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
    lastLoginMethod({
      storeInDatabase: true,
    }),
    apiKey({
      startingCharactersConfig: {
        shouldStore: false,
      },
      defaultPrefix: "lapp_",
      requireName: true,
      enableMetadata: true,
    }),
    openAPI({
      disableDefaultReference: process.env.NODE_ENV === "production",
    }),
  ],
  user: {
    additionalFields: {
      lastLoginMethod: {
        type: "string",
        required: false,
      },
      projectsLimit: {
        type: "number",
        defaultValue: 5,
      },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true, // TODO: should be false if email service is configured
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
  advanced: {
    cookiePrefix: "localine",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (_, ctx) => {
          if (signUpDisabled && ctx?.path != "/admin/create-user") {
            throw new APIError("BAD_REQUEST", {
              message: "signup disabled",
            })
          }
        },
      },
    },
  },
})
