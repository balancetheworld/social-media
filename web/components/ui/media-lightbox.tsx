"use client"

import { useState, useCallback, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

import type { MediaLightboxProps } from "@/types/components"

export function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
  type MediaType = MediaLightboxProps["media"][number]
  const [index, setIndex] = useState(initialIndex)
  const current = media[index]

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : media.length - 1)), [media.length])
  const next = useCallback(() => setIndex((i) => (i < media.length - 1 ? i + 1 : 0)), [media.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, prev, next])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85" onClick={onClose}>
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-10"
        aria-label="关闭"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      {media.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 z-10">
          {index + 1} / {media.length}
        </div>
      )}

      {/* Prev / Next */}
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors z-10"
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors z-10"
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="max-h-[90vh] max-w-[90vw] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt="图片详情"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        ) : (
          <video
            key={current.url}
            src={current.url}
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
            controls
            autoPlay
          />
        )}
      </div>
    </div>
  )
}
