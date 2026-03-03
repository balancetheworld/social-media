"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { User, Post, Conversation, Notification } from "./types"
import { api } from "./api-client"

interface SocialContextType {
  currentUserId: string | null
  currentUser: User | null
  isLoggedIn: boolean
  isLoading: boolean
  users: User[]
  posts: Post[]
  conversations: Conversation[]
  notifications: Notification[]
  getUser: (id: string) => User | undefined
  createPost: (content: string, tags?: string[], media?: { type: string; url: string }[]) => Promise<void>
  toggleLike: (postId: string) => Promise<void>
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>
  addComment: (postId: string, content: string) => Promise<void>
  toggleFollow: (targetUserId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string) => Promise<void>
  markNotificationsRead: () => Promise<void>
  unreadNotificationCount: number
  unreadMessageCount: number
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  refreshData: () => Promise<void>
}

const SocialContext = createContext<SocialContextType | null>(null)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentUserId = currentUser?.id ?? null
  const isLoggedIn = !!currentUser

  // Load all data
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
        // Load authenticated data
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
      // silent fail on load
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
      // Set user immediately from the response, then refresh all data in background
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

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!currentUserId) return
      // Optimistic update
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
        // Revert on failure
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
        // silently fail, data will be correct on next refresh
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
      // Optimistic update
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
      // Also update currentUser
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
        // Revert on next refresh
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
      // silently fail
    }
  }, [])

  const unreadNotificationCount = notifs.filter((n) => !n.read).length

  const unreadMessageCount = conversations.reduce((count, conv) => {
    return (
      count +
      conv.messages.filter((m) => !m.read && m.senderId !== currentUserId).length
    )
  }, 0)

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
        unreadNotificationCount,
        unreadMessageCount,
        login,
        register,
        logout,
        refreshData,
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
