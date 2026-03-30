"use client"

import { createContext, useContext, useState, useMemo } from "react"
import { useSocial } from "./social-context"
import type { Post } from "./types"
import type { SearchContextType } from "@/types/context"

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { posts } = useSocial()
  const [query, setQuery] = useState("")

  const trimmed = query.trim().toLowerCase()
  const isSearching = trimmed.length > 0

  const postResults = useMemo(() => {
    if (!trimmed) return []
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(trimmed) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(trimmed)))
    )
  }, [trimmed, posts])

  return (
    <SearchContext.Provider value={{ query, setQuery, postResults, isSearching }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used within SearchProvider")
  return ctx
}
