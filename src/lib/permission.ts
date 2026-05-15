import { createAccessControl } from "better-auth/plugins"
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access"

export const statement = {
  locales: ["create", "update", "delete"],
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  locales: ["create", "update", "delete"],
  ...adminAc.statements,
})

export const user = ac.newRole({
  ...userAc.statements,
})
