"use client"

import { useState, useEffect, useRef } from "react"
import { Send, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { formatTime } from "@/lib/format"
import AppShell from "@/components/layout/app-shell"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function MessagesPage() {
  const t = useTranslations("message")
  const locale = useLocale()
  const { conversations, currentUserId, getUser, sendMessage, markConversationRead } = useSocial()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")

  // 当选择对话时，标记消息为已读
  useEffect(() => {
    if (selectedConvId) {
      markConversationRead(selectedConvId)
    }
  }, [selectedConvId, markConversationRead])

  const selectedConv = conversations.find((c) => c.id === selectedConvId)
  const otherUserId = selectedConv?.participants.find((p) => p !== currentUserId)
  const otherUser = otherUserId ? getUser(otherUserId) : null

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConv?.messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId) return
    await sendMessage(selectedConvId, newMessage.trim())
    setNewMessage("")
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-1px)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 shrink-0">
          <h1 className="text-xl font-bold">私信</h1>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Conversation List - Left Sidebar */}
          <div className={cn(
            "w-full flex-col border-r border-border/40 md:w-[320px] shrink-0 min-h-0",
            selectedConvId ? "hidden md:flex" : "flex"
          )}>
            <div className="conversation-list flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <p className="text-muted-foreground">暂无私信对话</p>
                </div>
              ) : (
                conversations
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
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/5",
                          selectedConvId === conv.id && "bg-primary/10"
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={other.avatar} alt={other.name} />
                            <AvatarFallback>{other.name[0]}</AvatarFallback>
                          </Avatar>
                          {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75" />
                              <span className="relative inline-flex h-3 w-3 rounded-full bg-muted-foreground" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold truncate">{other.name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                              {formatTime(conv.lastActivity, locale)}
                            </span>
                          </div>
                          <p className={cn(
                            "truncate text-sm mt-0.5",
                            hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}>
                            {lastMsg?.senderId === currentUserId && "你: "}
                            {lastMsg?.content || "暂无消息"}
                          </p>
                        </div>
                      </button>
                    )
                  })
              )}
            </div>
          </div>

          {/* Chat Area - Right Side */}
          <div className={cn(
            "flex-1 flex-col bg-background/50 min-h-0",
            selectedConvId ? "flex" : "hidden md:flex"
          )}>
            {selectedConv && otherUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 shrink-0">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-primary/10 md:hidden"
                    aria-label="返回"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 hover:bg-primary/5 rounded-full p-1 -ml-1 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback className="text-sm">{otherUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{otherUser.name}</span>
                      <span className="text-xs text-muted-foreground">@{otherUser.handle}</span>
                    </div>
                  </Link>
                </div>

                {/* Messages Area */}
                <div className="messages-area flex-1 overflow-y-auto overflow-x-hidden overscroll-contain min-h-0">
                  <div className="flex flex-col p-4 gap-3">
                    {selectedConv.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-muted-foreground">开始和 {otherUser.name} 聊天吧</p>
                      </div>
                    ) : (
                      selectedConv.messages.map((msg) => {
                        const isOwn = msg.senderId === currentUserId
                        return (
                          <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            )}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={cn(
                                "mt-1 text-[10px] text-right",
                                isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                              )}>
                                {formatTime(msg.createdAt, locale)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-border/30 p-4 shrink-0">
                  <div className="flex items-end gap-2">
                    <div className="glass-input flex-1 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="发消息..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className={cn(
                        "rounded-full h-10 w-10 shrink-0 p-0 transition-all",
                        newMessage.trim()
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-bold">选择一个对话</h2>
                <p className="mt-2 text-sm text-muted-foreground">从左侧列表中选择一个对话开始聊天</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .conversation-list::-webkit-scrollbar,
        .messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .conversation-list:hover::-webkit-scrollbar-thumb,
        .messages-area:hover::-webkit-scrollbar-thumb {
          background-color: hsl(var(--muted-foreground) / 0.2);
          border-radius: 3px;
        }

        .conversation-list:hover::-webkit-scrollbar-thumb:hover,
        .messages-area:hover::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--muted-foreground) / 0.3);
        }

        /* Firefox scrollbar */
        .conversation-list,
        .messages-area {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }

        .conversation-list:hover,
        .messages-area:hover {
          scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
        }
      `}</style>
    </AppShell>
  )
}
