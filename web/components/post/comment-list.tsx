"use client"

import { useState } from "react"
import { Heart, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
    await addComment(post.id, newComment.trim())
    setNewComment("")
  }

  return (
    <div className="flex flex-col gap-3">
      {post.comments.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">暂无评论</p>
      )}
      {post.comments.map((comment) => {
        const commentAuthor = getUser(comment.authorId)
        if (!commentAuthor) return null
        const isLiked = currentUserId ? comment.likes.includes(currentUserId) : false

        return (
          <div key={comment.id} className="flex gap-2.5">
            <Link href={`/profile/${commentAuthor.id}`} className="shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={commentAuthor.avatar} alt={commentAuthor.name} />
                <AvatarFallback>{commentAuthor.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/profile/${commentAuthor.id}`}
                  className="text-sm font-semibold text-foreground hover:underline"
                >
                  {commentAuthor.name}
                </Link>
                <span className="text-xs text-muted-foreground">@{commentAuthor.handle}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <time className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</time>
              </div>
              <p className="mt-0.5 text-sm text-foreground leading-relaxed">{comment.content}</p>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "mt-0.5 h-7 w-fit gap-1 rounded-full px-2",
                  isLiked
                    ? "text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                )}
                onClick={() => isLoggedIn ? toggleCommentLike(post.id, comment.id) : showPrompt("登录后可以点赞")}
              >
                <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                {comment.likes.length > 0 && (
                  <span className="text-xs">{comment.likes.length}</span>
                )}
              </Button>
            </div>
          </div>
        )
      })}

      {/* 新评论输入 */}
      {currentUser && (
        <div className="flex items-center gap-2.5 mt-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="发表评论..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">发送评论</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
