import type { AdminUser } from "./entities"

export interface PageHeaderProps {
  title: string
  icon?: "home" | "hash" | "bell" | "mail" | "user" | "bookmark" | "search"
  showBackButton?: boolean
}

export interface FollowListDialogProps {
  userIds: string[]
  title: string
  open: boolean
  onClose: () => void
}

export interface FollowButtonProps {
  userId: string
  size?: "sm" | "default"
  className?: string
}

export interface MediaLightboxProps {
  media: Array<{ type: "image" | "video"; url: string }>
  initialIndex: number
  onClose: () => void
}

export interface PostComposeProps {
  onSuccess?: () => void
  inDialog?: boolean
}

export interface UserActionsDialogProps {
  user: AdminUser
  open: boolean
  onClose: () => void
  onUpdate: () => void
}

export interface ThemeToggleProps {
  showLabel?: boolean
}

export interface LanguageSwitcherProps {
  showLabel?: boolean
}

export interface AdminTab {
  value: "posts" | "users"
  label: string
}
