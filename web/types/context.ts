import type { User, Post, Conversation, Notification } from "./entities"

export interface SocialContextType {
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
  markConversationRead: (conversationId: string) => void
  unreadNotificationCount: number
  unreadMessageCount: number
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  refreshData: () => Promise<void>
  deletePost: (postId: string) => Promise<void>
  showComposeDialog: boolean
  openComposeDialog: () => void
  closeComposeDialog: () => void
}

export interface SearchContextType {
  query: string
  setQuery: (q: string) => void
  postResults: Post[]
  isSearching: boolean
}

export interface LoginPromptContextType {
  showPrompt: (message?: string) => void
}
