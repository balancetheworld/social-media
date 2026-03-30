"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Calendar } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { FollowButton } from "@/components/ui/follow-button"
import { FollowListDialog } from "./follow-list-dialog"
import { useTranslations, useLocale } from "next-intl"
import type { User } from "@/lib/types"

export function ProfileHeader({ user }: { user: User }) {
  const t = useTranslations("profile")
  const locale = useLocale()
  const { currentUserId, isLoggedIn, currentUser } = useSocial()
  const isOwnProfile = isLoggedIn && user.id === currentUserId
  const [listType, setListType] = useState<"following" | "followers" | null>(null)

  const joinDate = new Date(user.joinDate)
  const joinMonth = joinDate.toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US", { year: "numeric", month: "long" })

  return (
    <div>
      {/* Cover area with gradient */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 via-accent to-secondary">
        <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
      </div>

      {/* User info */}
      <div className="px-5">
        <div className="relative flex items-end justify-between">
          <Avatar className="-mt-12 h-24 w-24 border-[3px] border-background shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="mb-2 flex items-center gap-2">
            {isOwnProfile ? (
              <Button variant="outline" className="rounded-full text-xs h-8 px-4">
                {t("editProfile")}
              </Button>
            ) : (
              <FollowButton userId={user.id} size="default" />
            )}
          </div>
        </div>

        <div className="mt-2.5 flex flex-col gap-1.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-foreground">{user.name}</h1>
              {user.verified && (
                <svg className="h-[18px] w-[18px] text-primary" viewBox="0 0 22 22" fill="currentColor" aria-label="Verified">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.272.587.706 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.131 1.222-.434 1.69-.88.445-.47.749-1.055.88-1.69.131-.636.083-1.293-.14-1.898.587-.273 1.084-.706 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{user.handle}</p>
          </div>

          <p className="text-sm leading-relaxed text-foreground">{user.bio}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {t("joinedAt", { date: joinMonth })}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm pb-3">
            <button onClick={() => setListType("following")} className="hover:underline transition-colors">
              <strong className="text-foreground">{user.following.length}</strong>
              <span className="text-muted-foreground ml-1 text-xs">{t("following")}</span>
            </button>
            <button onClick={() => setListType("followers")} className="hover:underline transition-colors">
              <strong className="text-foreground">{user.followers.length}</strong>
              <span className="text-muted-foreground ml-1 text-xs">{t("followers")}</span>
            </button>
          </div>
        </div>
      </div>

      <FollowListDialog
        open={listType !== null}
        onClose={() => setListType(null)}
        title={listType === "following" ? t("following") : t("followers")}
        userIds={listType === "following" ? user.following : user.followers}
      />
    </div>
  )
}
