import { createAccessControl } from "better-auth/plugins"
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access"

export const statement = {
  dashboard: ["admin"],
  locales: ["create", "update", "delete"],
  plans: ["create", "update", "delete"],
  projects: ["read", "update", "delete"],
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  dashboard: ["admin"],
  locales: ["create", "update", "delete"],
  plans: ["create", "update", "delete"],
  projects: ["read", "update", "delete"],
  ...adminAc.statements,
})

export const user = ac.newRole({
  ...userAc.statements,
})
