import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields, lastLoginMethodClient } from "better-auth/client/plugins"
import { toast } from "sonner"
import { ac, admin, user } from "@/lib/permission"
import { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  fetchOptions: {
    onError: (e) => {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.")
      }
    },
  },
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    lastLoginMethodClient(),
  ],
})

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;