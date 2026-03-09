export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'banned'

export interface User {
  id: string
  name: string
  handle: string
  avatar: string
  bio: string
  location: string
  joinDate: string
  followers: string[]
  following: string[]
  verified: boolean
  coverImage: string
  role: UserRole
  status: UserStatus
  canPost: boolean
  canComment: boolean
  canSendMessage: boolean
}

export interface Post {
  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: string
  likes: string[]
  repostCount: number
  comments: Comment[]
  bookmarks: string[]
  tags: string[]
  media: { type: "image" | "video"; url: string }[]
}

export interface Comment {
  id: string
  authorId: string
  postId: string
  content: string
  createdAt: string
  likes: string[]
}

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  lastActivity: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
  read: boolean
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "repost"
  fromUserId: string
  postId?: string
  createdAt: string
  read: boolean
}
