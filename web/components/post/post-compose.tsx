"use client"

import { useState, useRef, useCallback } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { api } from "@/lib/api-client"
import { Hash, X, ImagePlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
  type: "image" | "video"
  url: string
  file?: File
  preview?: string
}

export function PostCompose() {
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
      // Upload any files that still have file references
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

  return (
    <div>
      <div className="flex gap-3 px-5 py-4">
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="有什么新鲜事？"
            className="min-h-[72px] w-full resize-none bg-transparent text-base text-card-foreground placeholder:text-muted-foreground outline-none"
            rows={2}
          />

          {/* Media previews (square) */}
          {mediaItems.length > 0 && (
            <div className={cn(
              "mt-2 grid gap-1.5",
              mediaItems.length === 1 ? "grid-cols-2" : mediaItems.length === 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
              {mediaItems.map((m, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted/30">
                  {m.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.preview || m.url}
                      alt="上传图片"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        src={m.preview || m.url}
                        className="absolute inset-0 h-full w-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-background/70 p-2">
                          <svg className="h-5 w-5 text-foreground/80" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 text-foreground/70 opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tags display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors" aria-label={`移除标签 ${tag}`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag input */}
          {showTagInput && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-2.5 py-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={tagRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => { addTag(); if (!tagInput.trim() && tags.length === 0) setShowTagInput(false) }}
                  placeholder="输入标签，回车添加"
                  className="flex-1 bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground outline-none"
                  maxLength={20}
                />
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{tags.length}/5</span>
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

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary"
                onClick={() => fileRef.current?.click()}
                disabled={mediaItems.length >= 4 || uploading}
              >
                {uploading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <ImagePlus className="h-[18px] w-[18px]" />}
                <span className="sr-only">添加图片或视频</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn("rounded-full hover:bg-primary/10", showTagInput || tags.length > 0 ? "text-primary" : "text-primary/70")}
                onClick={() => {
                  setShowTagInput(!showTagInput)
                  setTimeout(() => tagRef.current?.focus(), 50)
                }}
              >
                <Hash className="h-[18px] w-[18px]" />
                <span className="sr-only">添加标签</span>
              </Button>
              {mediaItems.length > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">{mediaItems.length}/4</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={cn("text-xs", isOverLimit ? "text-destructive" : "text-muted-foreground")}>
                  {charLimit - charCount}
                </span>
              )}
              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && mediaItems.length === 0) || isOverLimit || submitting}
                className="rounded-full px-5 text-xs"
                size="sm"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "发布"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-5 h-px bg-border/30" />
    </div>
  )
}
