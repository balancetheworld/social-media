"use client"

import { PostCard } from "@/components/post/post-card"
import { PageHeader } from "@/components/layout/page-header"
import { useSocial } from "@/lib/social-context"
import { useSearch } from "@/lib/search-context"
import { useTranslations } from "next-intl"
import AppShell from "@/components/layout/app-shell"
import { Search, X } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const t = useTranslations("post")
  const { posts, isLoading } = useSocial()
  const { isSearching, postResults, query, setQuery } = useSearch()

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const displayPosts = isSearching ? postResults : sortedPosts

  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Page Header */}
        <PageHeader title="首页" icon="home" />

        {/* Search results banner */}
        {isSearching && (
          <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Search className="h-5 w-5 text-primary shrink-0" />
              <span className="text-base text-foreground truncate">
                搜索 <span className="font-semibold text-primary">"{query}"</span>
              </span>
              <span className="text-sm text-muted-foreground shrink-0">({postResults.length} 篇帖子)</span>
            </div>
            <button
              onClick={() => setQuery("")}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="py-24 text-center text-muted-foreground">
            {isSearching ? t("notFound") : t("noPosts")}
          </div>
        )}
      </div>
    </AppShell>
  )
}
