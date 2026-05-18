import { FileTextIcon, FolderOpenIcon, FoldersIcon, GlobeIcon, HomeIcon, KeyRoundIcon, LibraryIcon, Link2Icon, LucideIcon, MonitorSmartphoneIcon, PackageIcon, ShieldCogIcon, SlidersHorizontalIcon, TagsIcon, UserIcon, UsersIcon, WorkflowIcon } from "lucide-react"

type NavigationItem = {
  name: string
  icon: LucideIcon
  href: string
}

export const navigationItems: NavigationItem[] = [
  { name: "Dashboard", icon: HomeIcon, href: "/" },
  { name: "Projects", icon: FolderOpenIcon, href: "/projects" },
]

export const accountNavigationItems: NavigationItem[] = [
  { name: "Public Profile", icon: UserIcon, href: "/account" },
  { name: "Sessions", icon: MonitorSmartphoneIcon, href: "/account/sessions" },
  { name: "Security", icon: ShieldCogIcon, href: "/account/security" },
  { name: "Connections", icon: Link2Icon, href: "/account/connections" },
  { name: "API Keys", icon: KeyRoundIcon, href: "/account/api-keys" },
]

export const projectNavigationItems: NavigationItem[] = [
  { name: "Overview", icon: HomeIcon, href: "/projects/[projectId]" },
  {
    name: "Translations",
    icon: FileTextIcon,
    href: "/projects/[projectId]/translations",
  },
  { name: "Terms", icon: LibraryIcon, href: "/projects/[projectId]/terms" },
  { name: "Labels", icon: TagsIcon, href: "/projects/[projectId]/labels" },
  { name: "Locales", icon: GlobeIcon, href: "/projects/[projectId]/locales" },
  { name: "Members", icon: UsersIcon, href: "/projects/[projectId]/members" },
]

export const projectSettingsNavigationItems: NavigationItem[] = [
  {
    name: "General",
    icon: SlidersHorizontalIcon,
    href: "/projects/[projectId]/settings",
  },
  {
    name: "Member Roles",
    icon: ShieldCogIcon,
    href: "/projects/[projectId]/settings/member-roles",
  },
  {
    name: "Workflows",
    icon: WorkflowIcon,
    href: "/projects/[projectId]/settings/workflows",
  },
]

export const adminNavigationItems: NavigationItem[] = [
  { name: "Users", icon: UsersIcon, href: "/admin/users" },
  { name: "Projects", icon: FoldersIcon, href: "/admin/projects" },
  { name: "Locales", icon: GlobeIcon, href: "/admin/locales" },
  { name: "Plans", icon: PackageIcon, href: "/admin/plans" },
]