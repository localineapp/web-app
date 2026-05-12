import { createAuthClient } from "better-auth/client";
import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins"
import { toast } from "sonner";
import { ac, admin, user } from "@/lib/permission";

export const authClient = createAuthClient({
  fetchOptions: {
    onError: (e) => {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.")
      }
    },
  },
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    lastLoginMethodClient()
  ]
});
