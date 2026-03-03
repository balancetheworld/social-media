"use client"

import { useState } from "react"
import { Send, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSocial } from "@/lib/social-context"
import { formatTime } from "@/lib/format"
import AppShell from "@/components/layout/app-shell"
import Link from "next/link"

export default function MessagesPage() {
  const { conversations, currentUserId, getUser, sendMessage } = useSocial()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const selectedConv = conversations.find((c) => c.id === selectedConvId)
  const otherUserId = selectedConv?.participants.find((p) => p !== currentUserId)
  const otherUser = otherUserId ? getUser(otherUserId) : null

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId) return
    await sendMessage(selectedConvId, newMessage.trim())
    setNewMessage("")
  }

  return (
    <AppShell>
      <div className="glass-card overflow-hidden">
        <header className="flex h-12 items-center border-b border-border/30 px-5">
          <h1 className="text-base font-bold text-card-foreground">私信</h1>
        </header>

        <div className="flex h-[calc(100vh-10rem)]">
          {/* Conversation list */}
          <div className={cn("w-full flex-col border-r border-border/30 md:flex md:w-[260px]", selectedConvId ? "hidden md:flex" : "flex")}>
            <ScrollArea className="flex-1">
              {conversations
                .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                .map((conv) => {
                  const otherId = conv.participants.find((p) => p !== currentUserId)
                  const other = otherId ? getUser(otherId) : null
                  if (!other) return null
                  const lastMsg = conv.messages[conv.messages.length - 1]
                  const hasUnread = conv.messages.some((m) => !m.read && m.senderId !== currentUserId)
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20", selectedConvId === conv.id && "bg-primary/5")}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={other.avatar} alt={other.name} />
                        <AvatarFallback>{other.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-card-foreground truncate">{other.name}</span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">{formatTime(conv.lastActivity)}</span>
                        </div>
                        <p className={cn("truncate text-xs mt-0.5", hasUnread ? "font-semibold text-card-foreground" : "text-muted-foreground")}>
                          {lastMsg?.senderId === currentUserId && "你："}
                          {lastMsg?.content}
                        </p>
                      </div>
                      {hasUnread && <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  )
                })}
            </ScrollArea>
          </div>

          {/* Chat */}
          <div className={cn("flex-1 flex-col", selectedConvId ? "flex" : "hidden md:flex")}>
            {selectedConv && otherUser ? (
              <>
                <div className="flex items-center gap-3 border-b border-border/30 px-4 py-2.5">
                  <button onClick={() => setSelectedConvId(null)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/30 md:hidden" aria-label="返回">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Link href={`/profile/${otherUser.id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback className="text-xs">{otherUser.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-col">
                    <Link href={`/profile/${otherUser.id}`} className="text-sm font-bold text-card-foreground hover:underline">{otherUser.name}</Link>
                    <span className="text-[11px] text-muted-foreground">@{otherUser.handle}</span>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col gap-2.5">
                    {selectedConv.messages.map((msg) => {
                      const isOwn = msg.senderId === currentUserId
                      return (
                        <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2", isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted/50 text-card-foreground rounded-bl-sm")}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={cn("mt-0.5 text-[10px]", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>{formatTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="border-t border-border/30 p-3">
                  <div className="flex items-center gap-2 rounded-full bg-muted/40 px-4 py-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="发送新消息" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                    <Button variant="ghost" size="icon-sm" className="shrink-0 rounded-full text-primary hover:bg-primary/10" onClick={handleSend} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">发送</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
                <h2 className="text-lg font-bold text-card-foreground">选择一个对话</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">从左侧列表中选择一个对话</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
