import type { User, Post, Comment, Conversation, Message, Notification, UserRole, UserStatus } from "@/lib/types"

export type { User, Post, Comment, Conversation, Message, Notification, UserRole, UserStatus }

export interface AdminUser {
  id: string
  username: string
  displayName: string
  avatar: string
  bio?: string
  role: string
  status: string
  canPost: boolean
  canComment: boolean
  canSendMessage: boolean
  createdAt?: string
}

export interface Author {
  id: string
  name: string
  handle: string
  avatar: string
}

export interface MediaItem {
  type: "image" | "video"
  url: string
  file?: File
  preview?: string
}

export interface PostMedia {
  type: "image" | "video"
  url: string
}
