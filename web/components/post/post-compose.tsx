"use client"

import { useState, useRef, useCallback } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { api } from "@/lib/api-client"
import { Hash, X, ImagePlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

import type { MediaItem } from "@/types/entities"
import type { PostComposeProps } from "@/types/components"

export function PostCompose({ onSuccess, inDialog = false }: PostComposeProps) {
  const t = useTranslations("post")
  const { currentUser, isLoggedIn, createPost } = useSocial()
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const tagRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isLoggedIn || !currentUser) return null

  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) return
    setSubmitting(true)
    try {
      const uploadedMedia: { type: string; url: string }[] = []
      for (const m of mediaItems) {
        if (m.file) {
          const res = await api.uploadFile(m.file)
          uploadedMedia.push(res)
        } else {
          uploadedMedia.push({ type: m.type, url: m.url })
        }
      }
      await createPost(content.trim(), tags, uploadedMedia)
      setContent("")
      setTags([])
      setTagInput("")
      setShowTagInput(false)
      setMediaItems([])
      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    if (mediaItems.length + files.length > 4) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith("image/")
        const isVideo = file.type.startsWith("video/")
        if (!isImage && !isVideo) continue

        const preview = URL.createObjectURL(file)
        setMediaItems((prev) => [
          ...prev,
          { type: isImage ? "image" : "video", url: "", file, preview },
        ])
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const item = prev[index]
      if (item.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const addTag = useCallback(() => {
    const t = tagInput.trim().replace(/^#/, "")
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags((prev) => [...prev, t])
      setTagInput("")
    }
  }, [tagInput, tags])

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const charLimit = 280
  const charCount = content.length
  const isOverLimit = charCount > charLimit

  const canPost = (content.trim().length > 0 || mediaItems.length > 0) && !isOverLimit && !submitting

  return (
    <div className={cn("flex gap-3", inDialog ? "px-4 py-3" : "")}>
      {!inDialog && (
        <div className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="有什么新鲜事？"
          className={cn(
            "w-full resize-none bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none",
            inDialog ? "min-h-[150px] p-4" : "min-h-[80px]"
          )}
          rows={inDialog ? 4 : 2}
          autoFocus={inDialog}
        />

        {/* Media previews */}
        {mediaItems.length > 0 && (
          <div className={cn(
            "mt-2 grid gap-1.5 rounded-2xl overflow-hidden",
            mediaItems.length === 1 ? "grid-cols-1" : mediaItems.length === 2 ? "grid-cols-2" : "grid-cols-3"
          )}>
            {mediaItems.map((m, i) => (
              <div key={i} className="relative group aspect-square bg-muted/20">
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.preview || m.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <video
                      src={m.preview || m.url}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/40 p-2">
                        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-2 left-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tags display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
                #{tag}
                <button onClick={() => removeTag(tag)} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        {showTagInput && (
          <div className="mt-2 flex items-center gap-2">
            <div className="glass-input flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={tagRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { addTag(); if (!tagInput.trim() && tags.length === 0) setShowTagInput(false) }}
                placeholder="添加标签"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                maxLength={20}
              />
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Actions */}
        <div className={cn(
          "flex items-center justify-between",
          inDialog ? "mt-3 px-4 pb-4" : "mt-3 border-t border-border/40 pt-3"
        )}>
          <div className="flex items-center gap-1">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              onClick={() => fileRef.current?.click()}
              disabled={mediaItems.length >= 4 || uploading}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </button>
            <button
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full hover:bg-primary/10 transition-colors",
                showTagInput || tags.length > 0 ? "text-primary" : "text-primary"
              )}
              onClick={() => {
                setShowTagInput(!showTagInput)
                setTimeout(() => tagRef.current?.focus(), 50)
              }}
            >
              <Hash className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {content.length > 0 && (
              <span className={cn("text-sm", isOverLimit ? "text-red-500" : "text-muted-foreground")}>
                {charLimit - charCount}
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canPost}
              className={cn(
                "rounded-full px-5 py-2 text-base font-bold transition-colors",
                canPost
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-primary/50 text-primary-foreground/50 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "发帖"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
