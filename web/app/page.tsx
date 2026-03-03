"use client"

import { PostCompose } from "@/components/post/post-compose"
import { PostCard } from "@/components/post/post-card"
import { useSocial } from "@/lib/social-context"
import { useSearch } from "@/lib/search-context"
import AppShell from "@/components/layout/app-shell"
import { Search, X } from "lucide-react"

export default function HomePage() {
  const { posts, isLoading, isLoggedIn } = useSocial()
  const { isSearching, postResults, query, setQuery } = useSearch()

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const displayPosts = isSearching ? postResults : sortedPosts

  return (
    <AppShell>
      <div className="glass-card overflow-hidden">
        {/* Search results banner */}
        {isSearching && (
          <div className="flex items-center justify-between gap-3 border-b border-border/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Search className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">
                {"搜索"} <span className="font-semibold text-primary">{'"'}{query}{'"'}</span> 的帖子结果
              </span>
              <span className="text-xs text-muted-foreground shrink-0">({postResults.length})</span>
            </div>
            <button
              onClick={() => setQuery("")}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Compose (hide when searching) */}
        {isLoggedIn && !isSearching && <PostCompose />}

        {/* Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="py-24 text-center text-muted-foreground text-sm">
            {isSearching ? "未找到相关帖子" : "暂无帖子"}
          </div>
        )}
      </div>
    </AppShell>
  )
}
