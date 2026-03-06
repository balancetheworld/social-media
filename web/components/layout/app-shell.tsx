"use client"

import { usePathname } from "next/navigation"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { RightPanel } from "@/components/layout/right-panel"
import { ComposeDialog } from "@/components/post/compose-dialog"
import { cn } from "@/lib/utils"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullScreenPage = pathname?.includes("/messages")

  return (
    <div className="min-h-screen bg-background">
      {/* Twitter-style 3-column layout */}
      <div className="flex justify-center">
        <div className="flex w-full max-w-[1300px] gap-6 px-0 md:px-6 lg:gap-8">
          {/* Left Sidebar - Navigation */}
          <LeftSidebar />

          {/* Main Content - Posts */}
          <main
            className={cn(
              "flex-1 min-w-0",
              isFullScreenPage ? "max-w-full" : "max-w-[600px]",
              !isFullScreenPage && "py-4 md:py-0"
            )}
          >
            {children}
          </main>

          {/* Right Sidebar - Search & Recommendations */}
          {!isFullScreenPage && <RightPanel />}
        </div>
      </div>

      {/* Mobile bottom navigation (shows instead of sidebars on small screens) */}
      <div className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-md z-50",
        isFullScreenPage && "hidden"
      )}>
        <div className="flex justify-around py-2">
          <MobileNavItem href="/" icon="home" label="首页" />
          <MobileNavItem href="/search" icon="search" label="搜索" />
          <MobileNavItem href="/notifications" icon="bell" label="通知" />
          <MobileNavItem href="/messages" icon="mail" label="消息" />
        </div>
      </div>

      {/* Compose Dialog */}
      <ComposeDialog />
    </div>
  )
}

// Simple mobile nav item component
function MobileNavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground hover:text-primary transition-colors"
    >
      <span className="text-xl">{icon === "home" ? "🏠" : icon === "search" ? "🔍" : icon === "bell" ? "🔔" : "✉️"}</span>
      <span className="text-[10px]">{label}</span>
    </a>
  )
}
