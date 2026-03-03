"use client"

import { useEffect } from "react"
import { Heart, MessageCircle, UserPlus, Repeat2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSocial } from "@/lib/social-context"
import { formatTime } from "@/lib/format"
import AppShell from "@/components/layout/app-shell"
import Link from "next/link"

const notifConfig = {
  like: { icon: Heart, color: "text-red-500", bgColor: "bg-red-500/10", text: "赞了你的帖子" },
  comment: { icon: MessageCircle, color: "text-primary", bgColor: "bg-primary/10", text: "评论了你的帖子" },
  follow: { icon: UserPlus, color: "text-primary", bgColor: "bg-primary/10", text: "关注了你" },
  repost: { icon: Repeat2, color: "text-emerald-600", bgColor: "bg-emerald-600/10", text: "转发了你的帖子" },
}

export default function NotificationsPage() {
  const { notifications, getUser, posts, markNotificationsRead, isLoggedIn } = useSocial()

  useEffect(() => {
    if (isLoggedIn) markNotificationsRead()
  }, [markNotificationsRead, isLoggedIn])

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <AppShell>
      <div className="glass-card overflow-hidden">
        <header className="flex h-12 items-center border-b border-border/30 px-5">
          <h1 className="text-base font-bold text-card-foreground">通知</h1>
        </header>

        {sortedNotifications.map((notif) => {
          const fromUser = getUser(notif.fromUserId)
          if (!fromUser) return null
          const config = notifConfig[notif.type]
          const Icon = config.icon
          const relatedPost = notif.postId ? posts.find((p) => p.id === notif.postId) : null

          return (
            <div key={notif.id}>
              <div className={cn("flex gap-3 px-5 py-3 transition-colors hover:bg-muted/20", !notif.read && "bg-primary/5")}>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bgColor)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${fromUser.id}`}>
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={fromUser.avatar} alt={fromUser.name} />
                        <AvatarFallback className="text-[10px]">{fromUser.name[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>
                  <p className="text-sm text-card-foreground">
                    <Link href={`/profile/${fromUser.id}`} className="font-bold hover:underline">{fromUser.name}</Link>
                    <span className="ml-1">{config.text}</span>
                  </p>
                  {relatedPost && <p className="text-xs text-muted-foreground line-clamp-2">{relatedPost.content}</p>}
                  <time className="text-[11px] text-muted-foreground">{formatTime(notif.createdAt)}</time>
                </div>
              </div>
              <div className="mx-5 h-px bg-border/30" />
            </div>
          )
        })}

        {sortedNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">暂无通知</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
