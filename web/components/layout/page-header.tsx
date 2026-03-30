"use client"

import { Home, Hash, Bell, Mail, User, Search } from "lucide-react"
import { usePathname } from "next/navigation"

import type { PageHeaderProps } from "@/types/components"

export function PageHeader({ title, icon = "home", showBackButton = false }: PageHeaderProps) {
  const pathname = usePathname()

  const IconComponent = {
    home: Home,
    hash: Hash,
    bell: Bell,
    mail: Mail,
    user: User,
    bookmark: Hash,
    search: Search,
  }[icon]

  return (
    <div className="sticky top-0 z-10 flex items-center gap-6 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/50 transition-colors">
          {showBackButton && (
            <button className="text-primary" aria-label="返回">
              ←
            </button>
          )}
        </div>
        {IconComponent && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <IconComponent className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </div>
  )
}
