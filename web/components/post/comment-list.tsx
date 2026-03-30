"use client"

import { useState } from "react"
import { Heart, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSocial } from "@/lib/social-context"
import { formatTime } from "@/lib/format"
import type { Post } from "@/lib/types"
import { useLoginPrompt } from "@/components/ui/login-prompt"
import Link from "next/link"

export function CommentList({ post }: { post: Post }) {
  const { getUser, currentUserId, currentUser, isLoggedIn, addComment, toggleCommentLike } = useSocial()
  const { showPrompt } = useLoginPrompt()
  const [newComment, setNewComment] = useState("")

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    // 检查评论权限
    if (!currentUser?.canComment) {
      alert("您的账号已被禁止评论，请联系管理员")
      return
    }

    // 检查账号状态
    if (currentUser?.status === "banned") {
      alert("您的账号已被封号，无法进行此操作")
      return
    }

    if (currentUser?.status === "suspended") {
      alert("您的账号已被禁言，无法进行此操作")
      return
    }

    try {
      await addComment(post.id, newComment.trim())
      setNewComment("")
    } catch (error: any) {
      alert(error?.message || "评论失败，请稍后重试")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {post.comments.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">暂无评论，来说点什么吧~</p>
      )}
      {post.comments.map((comment) => {
        const commentAuthor = getUser(comment.authorId)
        if (!commentAuthor) return null
        const isLiked = currentUserId ? comment.likes.includes(currentUserId) : false

        return (
          <div key={comment.id} className="flex gap-3">
            <Link href={`/profile/${commentAuthor.id}`} className="shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={commentAuthor.avatar} alt={commentAuthor.name} />
                <AvatarFallback className="text-xs">{commentAuthor.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-1 flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${commentAuthor.id}`}
                  className="text-sm font-bold text-foreground hover:underline"
                >
                  {commentAuthor.name}
                </Link>
                <span className="text-sm text-muted-foreground">@{commentAuthor.handle}</span>
                <span className="text-muted-foreground text-sm">·</span>
                <time className="text-sm text-muted-foreground">{formatTime(comment.createdAt, "zh")}</time>
              </div>
              <p className="mt-0.5 text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
              <button
                className={cn(
                  "mt-1 flex items-center gap-1 text-sm group transition-colors",
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                )}
                onClick={() => isLoggedIn ? toggleCommentLike(post.id, comment.id) : showPrompt("请先登录")}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
              </button>
            </div>
          </div>
        )
      })}

      {/* 新评论输入 */}
      {currentUser && (
        <div className="flex items-center gap-3 mt-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-xs">{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="glass-input flex flex-1 items-center gap-2 rounded-full px-4 py-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="写下你的评论..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                newComment.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              )}
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
