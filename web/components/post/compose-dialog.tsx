"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { PostCompose } from "./post-compose"
import { useSocial } from "@/lib/social-context"

export function ComposeDialog() {
  const { showComposeDialog, closeComposeDialog } = useSocial()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeComposeDialog()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [closeComposeDialog])

  if (!showComposeDialog) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 backdrop-blur-md p-4 pt-16"
      onClick={closeComposeDialog}
    >
      <div
        className="glass-panel w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h2 className="text-xl font-bold">发帖</h2>
          <button
            onClick={closeComposeDialog}
            className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Compose Form */}
        <PostCompose onSuccess={closeComposeDialog} inDialog />
      </div>
    </div>
  )
}
