export const ProjectPermission = {
  TRANSLATE: 1n << 0n, // Allows translating terms (fine-grained management through assigned locales)
  CREATE_TERMS: 1n << 1n, // Allows creating new terms
  UPDATE_TERMS: 1n << 2n, // Allows changing term key and context
  ASSIGN_LABELS: 1n << 3n, // Allows assigning and unassigning labels to terms
  LOCK_TERMS: 1n << 4n, // Allows locking and unlocking terms
  DELETE_TERMS: 1n << 5n, // Allows deleting terms and their translations
  MANAGE_LABELS: 1n << 6n, // Allows creating, updating and deleting labels
  INVITE_MEMBERS: 1n << 7n, // Allows inviting new members to the project
  MANAGE_MEMBERS: 1n << 8n, // Allows changing member permissions and removing members
  MANAGE_PROJECT: 1n << 9n, // Allows changing basic project settings
  MANAGE_ROLES: 1n << 10n, // Allows creating, updating and deleting member roles
  MANAGE_WORKFLOWS: 1n << 11n, // Allows creating, updating and deleting workflows
} as const

export const AllProjectPermissions: bigint = combinePermissions(
  ...Object.values(ProjectPermission)
)

export type ProjectPermissionKey = keyof typeof ProjectPermission
export type ProjectPermissionValue =
  (typeof ProjectPermission)[ProjectPermissionKey]

export function combinePermissions(
  ...permissions: ProjectPermissionValue[]
): bigint {
  return permissions.reduce((combined, permission) => combined | permission, 0n)
}

export function getPermissions(permissions: bigint): ProjectPermissionKey[] {
  const result: ProjectPermissionKey[] = []

  for (const [key, value] of Object.entries(ProjectPermission)) {
    if ((permissions & value) !== 0n) {
      result.push(key as ProjectPermissionKey)
    }
  }

  return result
}

export function hasPermission(
  permissions: bigint,
  permission: ProjectPermissionValue
): boolean {
  return (permissions & permission) !== 0n
}
