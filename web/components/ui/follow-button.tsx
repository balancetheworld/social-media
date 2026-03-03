"use client"

import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { useLoginPrompt } from "@/components/ui/login-prompt"
import { cn } from "@/lib/utils"
import { UserCheck, UserPlus, Users } from "lucide-react"

interface FollowButtonProps {
  userId: string
  size?: "sm" | "default"
  className?: string
}

export function FollowButton({ userId, size = "sm", className }: FollowButtonProps) {
  const { currentUser, currentUserId, isLoggedIn, toggleFollow } = useSocial()
  const { showPrompt } = useLoginPrompt()

  if (userId === currentUserId) return null

  const isFollowing = currentUser?.following.includes(userId) ?? false
  const isFollowedBy = currentUser?.followers?.includes(userId) ?? false
  const isMutual = isFollowing && isFollowedBy

  const handleClick = () => {
    if (!isLoggedIn) {
      showPrompt("登录后可以关注")
      return
    }
    toggleFollow(userId)
  }

  if (isMutual) {
    return (
      <Button
        size={size}
        variant="outline"
        className={cn(
          "rounded-full border-primary/20 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 group transition-all",
          size === "sm" ? "h-7 px-2.5 text-xs gap-1" : "h-8 px-3 text-xs gap-1.5",
          className
        )}
        onClick={handleClick}
      >
        <Users className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        <span className="group-hover:hidden">互关</span>
        <span className="hidden group-hover:inline">取消</span>
      </Button>
    )
  }

  if (isFollowing) {
    return (
      <Button
        size={size}
        variant="outline"
        className={cn(
          "rounded-full border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 group transition-all",
          size === "sm" ? "h-7 px-2.5 text-xs gap-1" : "h-8 px-3 text-xs gap-1.5",
          className
        )}
        onClick={handleClick}
      >
        <UserCheck className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        <span className="group-hover:hidden">已关注</span>
        <span className="hidden group-hover:inline">取消</span>
      </Button>
    )
  }

  if (isFollowedBy) {
    return (
      <Button
        size={size}
        className={cn(
          "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all",
          size === "sm" ? "h-7 px-2.5 text-xs gap-1" : "h-8 px-3 text-xs gap-1.5",
          className
        )}
        onClick={handleClick}
      >
        <UserPlus className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        回粉
      </Button>
    )
  }

  return (
    <Button
      size={size}
      className={cn(
        "rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all",
        size === "sm" ? "h-7 px-3 text-xs" : "h-8 px-4 text-xs",
        className
      )}
      onClick={handleClick}
    >
      关注
    </Button>
  )
}
