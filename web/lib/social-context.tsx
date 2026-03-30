"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { User, Post, Conversation, Notification } from "./types"
import type { SocialContextType } from "@/types/context"
import { api } from "./api-client"

const SocialContext = createContext<SocialContextType | null>(null)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showComposeDialog, setShowComposeDialog] = useState(false)

  const currentUserId = currentUser?.id ?? null
  const isLoggedIn = !!currentUser

  const refreshData = useCallback(async () => {
    try {
      const [usersRes, postsRes, meRes] = await Promise.all([
        api.getUsers(),
        api.getPosts(),
        api.getMe(),
      ])
      setUsers(usersRes.users)
      setPosts(postsRes.posts)

      if (meRes.user) {
        setCurrentUser(meRes.user)
        const [convsRes, notifsRes] = await Promise.all([
          api.getConversations(),
          api.getNotifications(),
        ])
        setConversations(convsRes.conversations)
        setNotifs(notifsRes.notifications)
      } else {
        setCurrentUser(null)
        setConversations([])
        setNotifs([])
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const getUser = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users]
  )

  const login = useCallback(
    async (username: string, password: string) => {
      await api.login(username, password)
      await refreshData()
    },
    [refreshData]
  )

  const register = useCallback(
    async (username: string, password: string, displayName: string) => {
      const res = await api.register(username, password, displayName)
      if (res.user) {
        setCurrentUser(res.user)
        setUsers((prev) => [...prev, res.user])
      }
      await refreshData()
    },
    [refreshData]
  )

  const logout = useCallback(async () => {
    await api.logout()
    setCurrentUser(null)
    setConversations([])
    setNotifs([])
  }, [])

  const createPost = useCallback(async (content: string, tags?: string[], media?: { type: string; url: string }[]) => {
    const { post } = await api.createPost(content, tags ?? [], media ?? [])
    setPosts((prev) => [post, ...prev])
  }, [])

  const deletePost = useCallback(async (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
    try {
      await api.deletePost(postId)
    } catch {
      await refreshData()
      throw new Error("删除失败")
    }
  }, [refreshData])

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!currentUserId) return
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post
          const liked = post.likes.includes(currentUserId)
          return {
            ...post,
            likes: liked
              ? post.likes.filter((id) => id !== currentUserId)
              : [...post.likes, currentUserId],
          }
        })
      )
      try {
        await api.toggleLike(postId)
      } catch {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post
            const liked = post.likes.includes(currentUserId)
            return {
              ...post,
              likes: liked
                ? post.likes.filter((id) => id !== currentUserId)
                : [...post.likes, currentUserId],
            }
          })
        )
      }
    },
    [currentUserId]
  )

  const toggleCommentLike = useCallback(
    async (postId: string, commentId: string) => {
      if (!currentUserId) return
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post
          return {
            ...post,
            comments: post.comments.map((c) => {
              if (c.id !== commentId) return c
              const liked = c.likes.includes(currentUserId)
              return {
                ...c,
                likes: liked
                  ? c.likes.filter((id) => id !== currentUserId)
                  : [...c.likes, currentUserId],
              }
            }),
          }
        })
      )
      try {
        await api.toggleCommentLike(commentId)
      } catch {
      }
    },
    [currentUserId]
  )

  const addComment = useCallback(
    async (postId: string, content: string) => {
      const { comment } = await api.addComment(postId, content)
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, comment] }
            : post
        )
      )
    },
    []
  )

  const toggleFollow = useCallback(
    async (targetUserId: string) => {
      if (!currentUserId) return
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === currentUserId) {
            const isFollowing = user.following.includes(targetUserId)
            return {
              ...user,
              following: isFollowing
                ? user.following.filter((id) => id !== targetUserId)
                : [...user.following, targetUserId],
            }
          }
          if (user.id === targetUserId) {
            const isFollower = user.followers.includes(currentUserId)
            return {
              ...user,
              followers: isFollower
                ? user.followers.filter((id) => id !== currentUserId)
                : [...user.followers, currentUserId],
            }
          }
          return user
        })
      )
      setCurrentUser((prev) => {
        if (!prev) return prev
        const isFollowing = prev.following.includes(targetUserId)
        return {
          ...prev,
          following: isFollowing
            ? prev.following.filter((id) => id !== targetUserId)
            : [...prev.following, targetUserId],
        }
      })
      try {
        await api.toggleFollow(targetUserId)
      } catch {
      }
    },
    [currentUserId]
  )

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const { message } = await api.sendMessage(conversationId, content)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, message],
                lastActivity: message.createdAt,
              }
            : conv
        )
      )
    },
    []
  )

  const markNotificationsRead = useCallback(async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await api.markNotificationsRead()
    } catch {
    }
  }, [])

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((m) =>
                m.senderId !== currentUserId ? { ...m, read: true } : m
              ),
            }
          : conv
      )
    )
  }, [currentUserId])

  const unreadNotificationCount = notifs.filter((n) => !n.read).length

  const unreadMessageCount = conversations.reduce((count, conv) => {
    return (
      count +
      conv.messages.filter((m) => !m.read && m.senderId !== currentUserId).length
    )
  }, 0)

  const openComposeDialog = useCallback(() => setShowComposeDialog(true), [])
  const closeComposeDialog = useCallback(() => setShowComposeDialog(false), [])

  return (
    <SocialContext.Provider
      value={{
        currentUserId,
        currentUser,
        isLoggedIn,
        isLoading,
        users,
        posts,
        conversations,
        notifications: notifs,
        getUser,
        createPost,
        toggleLike,
        toggleCommentLike,
        addComment,
        toggleFollow,
        sendMessage,
        markNotificationsRead,
        markConversationRead,
        unreadNotificationCount,
        unreadMessageCount,
        login,
        register,
        logout,
        refreshData,
        deletePost,
        showComposeDialog,
        openComposeDialog,
        closeComposeDialog,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (!context) throw new Error("useSocial must be used within SocialProvider")
  return context
}
