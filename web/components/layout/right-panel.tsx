"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, TrendingUp, X, Hash } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FollowButton } from "@/components/ui/follow-button"
import { useSocial } from "@/lib/social-context"
import { useSearch } from "@/lib/search-context"
import { formatCount } from "@/lib/format"

export function RightPanel() {
  const { users, posts, currentUserId } = useSocial()
  const { query, setQuery, isSearching, postResults } = useSearch()
  const [localQuery, setLocalQuery] = useState(query)
  const pathname = usePathname()
  const router = useRouter()

  // 同步全局 query 到 localQuery
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  const trimmed = localQuery.trim().toLowerCase()

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
  const suggestedUsers = users.filter((u) => u.id !== currentUserId).slice(0, 5)

  const handleSearch = (value: string) => {
    setLocalQuery(value)
    setQuery(value)
  }

  const handleClearSearch = () => {
    setLocalQuery("")
    setQuery("")
    // 如果在搜索页面，跳转回首页
    if (pathname?.includes("/search")) {
      router.push("/")
    }
  }

  return (
    <aside className="hidden lg:block w-[350px] shrink-0 py-4">
      {/* Search - 固定在顶端 */}
      <div className="sticky top-0 pb-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索"
            className="glass-input h-12 w-full rounded-full px-14 pl-14 text-base outline-none placeholder:text-muted-foreground transition-all"
          />
          {trimmed && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {(trimmed || isSearching) && (
        <div className="glass-card overflow-hidden">
          {!hasResults && (
            <p className="px-4 py-8 text-center text-base text-muted-foreground">未找到相关结果</p>
          )}

          {/* Tag results */}
          {tagResults.length > 0 && (
            <div>
              <div className="px-4 py-3 text-sm font-bold">标签</div>
              {tagResults.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">#{tag}</span>
                    <span className="text-sm text-muted-foreground">{formatCount(count)} 篇帖子</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* User results */}
          {userResults.length > 0 && (
            <div>
              {tagResults.length > 0 && <div className="h-px bg-border/40" />}
              <div className="px-4 py-3 text-sm font-bold">用户</div>
              {userResults.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                  <Link href={`/profile/${user.id}`} className="shrink-0" onClick={() => handleSearch("")}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-sm">{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-1 flex-col min-w-0">
                    <Link
                      href={`/profile/${user.id}`}
                      className="text-base font-bold truncate hover:underline"
                      onClick={() => handleSearch("")}
                    >
                      {user.name}
                    </Link>
                    <span className="text-sm text-muted-foreground truncate">@{user.handle}</span>
                  </div>
                  <FollowButton userId={user.id} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trending & Suggested (only show when not searching) */}
      {!trimmed && !isSearching && (
        <div className="flex flex-col gap-4">
          {/* Trending */}
          {trendingTags.length > 0 && (
            <div className="glass-card overflow-hidden">
              <h2 className="px-4 py-3 text-xl font-bold">中国的趋势</h2>
              <div className="flex flex-col">
                {trendingTags.map(([tag, count], index) => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="flex gap-4 px-4 py-3 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex flex-col items-start min-w-[40px]">
                      <span className="text-base text-muted-foreground">{index + 1}</span>
                      <span className="text-xs text-muted-foreground">趋势</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold">#{tag}</span>
                      <span className="text-sm text-muted-foreground">{formatCount(count)} 篇帖子</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {}}
                className="px-4 py-3 text-sm text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors text-left w-full"
              >
                显示更多
              </button>
            </div>
          )}

          {/* Suggested users */}
          {suggestedUsers.length > 0 && (
            <div className="glass-card overflow-hidden">
              <h2 className="px-4 py-3 text-xl font-bold">推荐关注</h2>
              <div className="flex flex-col">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                    <Link href={`/profile/${user.id}`} className="shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-sm">{user.name[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex flex-1 flex-col min-w-0">
                      <Link
                        href={`/profile/${user.id}`}
                        className="text-base font-bold truncate hover:underline"
                      >
                        {user.name}
                      </Link>
                      <span className="text-sm text-muted-foreground truncate">@{user.handle}</span>
                    </div>
                    <FollowButton userId={user.id} size="sm" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {}}
                className="px-4 py-3 text-sm text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors text-left w-full"
              >
                显示更多
              </button>
            </div>
          )}

          {/* Footer links */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-3 text-sm text-muted-foreground">
            <a href="#" className="hover:underline">服务条款</a>
            <a href="#" className="hover:underline">隐私政策</a>
            <a href="#" className="hover:underline">Cookie政策</a>
            <a href="#" className="hover:underline">辅助功能</a>
            <a href="#" className="hover:underline">广告信息</a>
            <span>© 2026 weiyan</span>
          </div>
        </div>
      )}
    </aside>
  )
}
