import { createAccessControl } from "better-auth/plugins"
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access"

export const statement = {
  dashboard: ["admin"],
  locales: ["create", "update", "delete"],
  projects: ["read:all"],
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  dashboard: ["admin"],
  locales: ["create", "update", "delete"],
  projects: ["read:all"],
  ...adminAc.statements,
})

export const user = ac.newRole({
  ...userAc.statements,
})
