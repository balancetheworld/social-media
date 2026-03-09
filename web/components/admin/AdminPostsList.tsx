"use client"

import { useState, useEffect } from "react"
import { Trash2, Search, Calendar, User as UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { api } from "@/lib/api-client"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Post {
  id: string
  authorId: string
  content: string
  createdAt: string
  likes: string[]
  comments: any[]
}

interface Author {
  id: string
  name: string
  handle: string
  avatar: string
}

export function AdminPostsList() {
  const t = useTranslations()
  const [posts, setPosts] = useState<Post[]>([])
  const [authors, setAuthors] = useState<Record<string, Author>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const loadPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])

        // 加载作者信息
        const userIds = Array.from(new Set(data.posts.map((p: Post) => p.authorId)))
        const usersRes = await api.getUsers()
        const usersMap: Record<string, Author> = {}
        userIds.forEach((id: string) => {
          const user = usersRes.users.find((u: Author) => u.id === id)
          if (user) {
            usersMap[id] = user
          }
        })
        setAuthors(usersMap)
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleDelete = async (postId: string) => {
    if (!confirm(t("admin.confirmDeletePost"))) return

    try {
      setDeletingIds((prev) => new Set(prev).add(postId))
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
      } else {
        alert(t("admin.deleteFailed"))
      }
    } catch (error) {
      alert(t("admin.deleteFailed"))
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    authors[p.authorId]?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    authors[p.authorId]?.handle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("admin.searchPosts")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* 帖子列表 */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {searchQuery ? t("admin.noSearchResults") : t("admin.noPosts")}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const author = authors[post.authorId]
            return (
              <div
                key={post.id}
                className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex gap-3">
                  {/* 作者头像 */}
                  {author && (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}

                  {/* 帖子内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {author && (
                        <>
                          <span className="font-semibold truncate">{author.name}</span>
                          <span className="text-sm text-muted-foreground">@{author.handle}</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                    </div>

                    <p className="text-sm whitespace-pre-wrap break-words mb-3">
                      {post.content}
                    </p>

                    {/* 统计信息 */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.likes.length} {t("post.likes") || "赞"}</span>
                      <span>{post.comments.length} {t("post.comments") || "评论"}</span>
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingIds.has(post.id)}
                    className="shrink-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("admin.deletePost")}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 统计信息 */}
      <div className="text-center text-sm text-muted-foreground">
        {t("admin.totalPosts", { count: filteredPosts.length })}
      </div>
    </div>
  )
}
