"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FollowButton } from "@/components/ui/follow-button"
import { useSocial } from "@/lib/social-context"

interface FollowListDialogProps {
  userIds: string[]
  title: string
  open: boolean
  onClose: () => void
}

export function FollowListDialog({ userIds, title, open, onClose }: FollowListDialogProps) {
  const { getUser } = useSocial()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm glass-card overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
          <h2 className="text-sm font-bold text-card-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {userIds.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">暂无用户</div>
          ) : (
            userIds.map((uid) => {
              const user = getUser(uid)
              if (!user) return null
              return (
                <div key={uid} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <Link href={`/profile/${uid}`} onClick={onClose} className="shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/profile/${uid}`} onClick={onClose} className="truncate text-sm font-bold text-card-foreground hover:underline">
                      {user.name}
                    </Link>
                    <span className="truncate text-xs text-muted-foreground">@{user.handle}</span>
                  </div>
                  <FollowButton userId={uid} />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
