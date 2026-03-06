"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, Heart, Repeat2, Share2, Check, Play, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaLightbox } from "@/components/ui/media-lightbox"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSocial } from "@/lib/social-context"
import { formatTime } from "@/lib/format"
import type { Post } from "@/lib/types"
import { useLoginPrompt } from "@/components/ui/login-prompt"
import { CommentList } from "./comment-list"

export function PostCard({ post }: { post: Post }) {
  const { getUser, currentUserId, toggleLike, isLoggedIn, deletePost, currentUser } = useSocial()
  const { showPrompt } = useLoginPrompt()
  const author = getUser(post.authorId)
  const [showComments, setShowComments] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)

  const isMyPost = currentUserId === post.authorId
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false

  if (!author) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePost(post.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLike = () => {
    if (isLoggedIn) {
      toggleLike(post.id)
      setLiked(!liked)
    } else {
      showPrompt("请先登录")
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${post.authorId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <article className="glass-card mx-3 mb-3 flex gap-3 px-4 py-4 cursor-pointer">
      <Link href={`/profile/${author.id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="text-sm">{author.name[0]}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={`/profile/${author.id}`}
            className="text-base font-bold text-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {author.name}
          </Link>
          {author.verified && (
            <svg className="h-4 w-4 shrink-0 text-primary" viewBox="0 0 22 22" fill="currentColor">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.272.587.706 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.131 1.222-.434 1.69-.88.445-.47.749-1.055.88-1.69.131-.636.083-1.293-.14-1.898.587-.273 1.084-.706 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
          )}
          <span className="text-sm text-muted-foreground">@{author.handle}</span>
          <span className="text-muted-foreground text-sm">·</span>
          <time className="text-sm text-muted-foreground hover:underline" suppressHydrationWarning>
            {formatTime(post.createdAt, "zh")}
          </time>
        </div>

        {/* Content */}
        <div className="mt-0.5 text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={cn(
            "mt-2 grid gap-1.5 rounded-2xl overflow-hidden",
            post.media.length === 1 ? "grid-cols-1" : post.media.length <= 2 ? "grid-cols-2" : "grid-cols-3"
          )}>
            {post.media.map((m, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className="relative aspect-square bg-muted/20 overflow-hidden group"
              >
                {m.type === "image" ? (
                  <img
                    src={m.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <video
                      src={m.url}
                      className="h-full w-full object-cover"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/40 p-2.5">
                        <Play className="h-6 w-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>
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
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-2 flex items-center justify-between max-w-md text-muted-foreground">
          <button
            onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
            className="flex items-center gap-2 group hover:text-primary transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-primary/10 transition-colors">
              <MessageCircle className="h-4 w-4" />
            </div>
            <span className="text-sm">{post.comments.length || ""}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={cn(
              "flex items-center gap-2 group hover:text-red-500 transition-colors",
              isLiked && "text-red-500"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-red-500/10 transition-colors">
              <Heart className={cn("h-4 w-4 transition-transform", isLiked && "fill-current scale-110")} />
            </div>
            <span className="text-sm">{post.likes.length || ""}</span>
          </button>

          <button
            className="flex items-center gap-2 group hover:text-green-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-green-500/10 transition-colors">
              <Repeat2 className="h-4 w-4" />
            </div>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="flex items-center gap-2 group hover:text-primary transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-primary/10 transition-colors">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            </div>
          </button>

          {isMyPost && (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    删除帖子
                  </DialogTitle>
                  <DialogDescription>
                    确定要删除这条帖子吗？此操作无法撤销。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                    className="rounded-full px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "删除中..." : "删除"}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {showComments && (
        <div className="border-t border-border/40 mt-2 pt-3">
          <CommentList post={post} />
        </div>
      )}
    </article>
  )
}
