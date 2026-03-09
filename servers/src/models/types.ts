/**
 * 类型定义模块
 * 定义整个应用中使用的数据类型
 */

// ==================== 用户相关 ====================

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
  verified: boolean
  coverImage: string
  followers: string[]
  following: string[]
  role: UserRole
  status: UserStatus
  canPost: boolean
  canComment: boolean
  canSendMessage: boolean
}

export interface UserRow {
  id: number
  username: string
  password_hash: string
  display_name: string
  avatar: string
  bio: string
  location: string
  verified: number
  cover_image: string
  created_at: string
  role: string
  status: string
  can_post: number
  can_comment: number
  can_send_message: number
}

// ==================== 帖子相关 ====================

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
  media: PostMedia[]
}

export interface PostRow {
  id: number
  author_id: number
  content: string
  repost_count: number
  created_at: string
}

export interface PostMedia {
  type: string
  url: string
}

// ==================== 评论相关 ====================

export interface Comment {
  id: string
  authorId: string
  postId: string
  content: string
  createdAt: string
  likes: string[]
}

export interface CommentRow {
  id: number
  post_id: number
  author_id: number
  content: string
  created_at: string
}

// ==================== 点赞相关 ====================

export interface Like {
  id: number
  targetType: string
  targetId: number
  userId: number
  createdAt: string
}

export interface LikeRow {
  id: number
  target_type: string
  target_id: number
  user_id: number
  created_at: string
}

// ==================== 关注相关 ====================

export interface Follow {
  id: number
  followerId: number
  followingId: number
  createdAt: string
}

export interface FollowRow {
  id: number
  follower_id: number
  following_id: number
  created_at: string
}

// ==================== 通知相关 ====================

export interface Notification {
  id: string
  type: string
  fromUserId: string
  toUserId: string
  postId?: string
  read: boolean
  createdAt: string
}

export interface NotificationRow {
  id: number
  type: string
  to_user_id: number
  from_user_id: number
  post_id: number | null
  is_read: number
  created_at: string
}

// ==================== 会话相关 ====================

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  lastActivity: string
}

export interface ConversationRow {
  id: number
  created_at: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
}

export interface MessageRow {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  is_read: number
  created_at: string
}

// ==================== 认证相关 ====================

export interface SessionRow {
  id: number
  token: string
  user_id: number
  expires_at: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  displayName: string
}

export interface AuthResponse {
  success: boolean
  userId?: string
  user?: User
  error?: string
}

// ==================== 通用类型 ====================

export interface DbResult {
  lastId: number
  changes: number
}

export interface ApiError {
  error: string
}

export interface ApiSuccess<T = any> {
  success: boolean
  data?: T
}
