import { createAccessControl } from "better-auth/plugins"
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access"

export const statement = {
  dashboard: ["admin", "updates"],
  apiKeys: ["unlimited", "no-rate-limit"],
  locales: ["read:disabled", "create", "update", "delete"],
  plans: ["read", "create", "update", "delete"],
  projects: ["read", "update", "update:plan", "delete"],
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  dashboard: ["admin", "updates"],
  apiKeys: ["unlimited", "no-rate-limit"],
  locales: ["read:disabled", "create", "update", "delete"],
  plans: ["read", "create", "update", "delete"],
  projects: ["read", "update", "update:plan", "delete"],
  ...adminAc.statements,
})

export const user = ac.newRole({
  ...userAc.statements,
})
