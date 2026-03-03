"use client"

import { FloatingNav } from "@/components/layout/header-nav"
import { RightPanel } from "@/components/layout/right-panel"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <FloatingNav />
      <div className="mx-auto flex max-w-4xl gap-5 px-4 pt-16 pb-20 md:pt-[72px] md:pb-8">
        <RightPanel />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
