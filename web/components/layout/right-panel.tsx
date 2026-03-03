"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Search, TrendingUp, X, Hash } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FollowButton } from "@/components/ui/follow-button"
import { useSocial } from "@/lib/social-context"
import { useSearch } from "@/lib/search-context"
import { formatCount } from "@/lib/format"

export function RightPanel() {
  const { users, posts, currentUserId } = useSocial()
  const { query, setQuery, isSearching, postResults } = useSearch()

  const trimmed = query.trim().toLowerCase()

  const userResults = useMemo(() => {
    if (!trimmed) return []
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(trimmed) ||
        u.handle.toLowerCase().includes(trimmed) ||
        (u.bio && u.bio.toLowerCase().includes(trimmed))
    )
  }, [trimmed, users])

  const tagResults = useMemo(() => {
    if (!trimmed) return []
    const tagMap = new Map<string, number>()
    for (const p of posts) {
      if (!p.tags) continue
      for (const t of p.tags) {
        if (t.toLowerCase().includes(trimmed)) {
          tagMap.set(t, (tagMap.get(t) || 0) + 1)
        }
      }
    }
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [trimmed, posts])

  const trendingTags = useMemo(() => {
    const tagMap = new Map<string, number>()
    for (const p of posts) {
      if (!p.tags) continue
      for (const t of p.tags) {
        tagMap.set(t, (tagMap.get(t) || 0) + 1)
      }
    }
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [posts])

  const hasResults = userResults.length > 0 || tagResults.length > 0 || postResults.length > 0
  const suggestedUsers = users.filter((u) => u.id !== currentUserId).slice(0, 3)

  return (
    <aside className="sticky top-20 hidden h-fit w-[260px] shrink-0 flex-col gap-3 lg:flex">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索用户、帖子、标签..."
          className="h-9 w-full rounded-xl bg-secondary/50 px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20"
        />
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        {trimmed && (
          <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Search results -- users and tags only (posts show in main area) */}
      {isSearching && (
        <div className="glass-card overflow-hidden">
          {!hasResults && (
            <p className="px-4 py-5 text-center text-sm text-muted-foreground">未找到相关结果</p>
          )}

          {/* Post count hint */}
          {postResults.length > 0 && (
            <div className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border/20">
              找到 <span className="font-semibold text-primary">{postResults.length}</span> 篇相关帖子，已在右侧展示
            </div>
          )}

          {/* Tag results */}
          {tagResults.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">标签</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {tagResults.map(([tag, count]) => (
                  <button key={tag} onClick={() => setQuery(tag)} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    #{tag}
                    <span className="text-[10px] text-primary/60">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User results */}
          {userResults.length > 0 && (
            <div>
              {tagResults.length > 0 && <div className="mx-4 h-px bg-border/20" />}
              <h3 className="px-4 pt-2.5 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">用户</h3>
              <div className="flex flex-col px-2 pb-2">
                {userResults.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/30 transition-colors">
                    <Link href={`/profile/${user.id}`} className="shrink-0" onClick={() => setQuery("")}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex flex-1 flex-col min-w-0">
                      <Link href={`/profile/${user.id}`} className="text-sm font-semibold leading-tight text-card-foreground hover:underline truncate" onClick={() => setQuery("")}>{user.name}</Link>
                      <span className="text-[11px] text-muted-foreground leading-tight truncate">@{user.handle}</span>
                    </div>
                    <FollowButton userId={user.id} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trending */}
      {!isSearching && trendingTags.length > 0 && (
        <div className="glass-card">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-card-foreground">热门话题</h2>
          </div>
          <div className="flex flex-col px-1 pb-1">
            {trendingTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="flex flex-col gap-0 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
              >
                <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">趋势</span>
                <span className="text-sm font-semibold text-card-foreground">#{tag}</span>
                <span className="text-[11px] text-muted-foreground">{formatCount(count)} 篇帖子使用</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested users */}
      {!isSearching && suggestedUsers.length > 0 && (
        <div className="glass-card">
          <h2 className="text-sm font-bold text-card-foreground px-4 pt-3.5 pb-2">推荐关注</h2>
          <div className="flex flex-col px-2 pb-2">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/30 transition-colors">
                <Link href={`/profile/${user.id}`} className="shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex flex-1 flex-col min-w-0">
                  <Link href={`/profile/${user.id}`} className="text-sm font-semibold leading-tight text-card-foreground hover:underline truncate">{user.name}</Link>
                  <span className="text-[11px] text-muted-foreground leading-tight truncate">@{user.handle}</span>
                </div>
                <FollowButton userId={user.id} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
