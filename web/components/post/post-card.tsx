"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, Heart, Share2, Check, Play } from "lucide-react"
import { MediaLightbox } from "@/components/ui/media-lightbox"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { formatTime } from "@/lib/format"
import type { Post } from "@/lib/types"
import { useLoginPrompt } from "@/components/ui/login-prompt"
import { CommentList } from "./comment-list"

export function PostCard({ post }: { post: Post }) {
  const { getUser, currentUserId, toggleLike, isLoggedIn } = useSocial()
  const { showPrompt } = useLoginPrompt()
  const author = getUser(post.authorId)
  const [showComments, setShowComments] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${post.authorId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!author) return null

  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false

  return (
    <article className="group transition-colors hover:bg-muted/15">
      <div className="flex gap-3 px-4 pt-3.5 pb-1">
        <Link href={`/profile/${author.id}`} className="shrink-0 mt-0.5">
          <Avatar className="h-9 w-9 ring-2 ring-background transition-shadow group-hover:ring-primary/10">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-xs">{author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${author.id}`} className="text-[13px] font-bold text-card-foreground hover:underline leading-tight">
              {author.name}
            </Link>
            {author.verified && (
              <svg className="h-3.5 w-3.5 shrink-0 text-primary" viewBox="0 0 22 22" fill="currentColor" aria-label="已认证">
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.272.587.706 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.131 1.222-.434 1.69-.88.445-.47.749-1.055.88-1.69.131-.636.083-1.293-.14-1.898.587-.273 1.084-.706 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
              </svg>
            )}
            <span className="text-xs text-muted-foreground">@{author.handle}</span>
            <span className="text-muted-foreground/40 text-xs">{"·"}</span>
            <time className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>{formatTime(post.createdAt)}</time>
          </div>

          <div className="mt-1 text-[13px] leading-relaxed text-card-foreground whitespace-pre-wrap break-words">
            {post.content}
          </div>

          {/* Media (square) */}
          {post.media && post.media.length > 0 && (
            <div className={cn(
              "mt-2 grid gap-1 rounded-xl overflow-hidden",
              post.media.length === 1 ? "grid-cols-2" : post.media.length <= 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
              {post.media.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="relative aspect-square bg-muted/20 overflow-hidden group cursor-pointer"
                >
                  {m.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt="帖子图片"
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <video
                        src={m.url}
                        className="absolute inset-0 h-full w-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                        <div className="rounded-full bg-background/70 p-2.5 shadow-sm">
                          <Play className="h-5 w-5 text-foreground/80 fill-current" />
                        </div>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Media Lightbox */}
          {lightboxIndex !== null && post.media && (
            <MediaLightbox
              media={post.media}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
            />
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 text-[11px] font-medium text-primary/80">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-1.5 flex items-center gap-0.5 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg h-7 px-2 text-xs"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {post.comments.length > 0 && <span>{post.comments.length}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 rounded-lg h-7 px-2 text-xs",
                isLiked ? "text-red-500 hover:text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              )}
              onClick={() => isLoggedIn ? toggleLike(post.id) : showPrompt("登录后可以点赞")}
            >
              <Heart className={cn("h-3.5 w-3.5 transition-transform", isLiked && "fill-current scale-110")} />
              {post.likes.length > 0 && <span>{post.likes.length}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg h-7 px-2 text-xs"
              onClick={handleShare}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied && <span className="text-emerald-500">已复制</span>}
            </Button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-3 pl-16">
          <CommentList post={post} />
        </div>
      )}

      <div className="mx-4 h-px bg-border/20" />
    </article>
  )
}
