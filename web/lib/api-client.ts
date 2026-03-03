const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "请求失败")
  }
  return data
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ success: boolean; userId: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string, displayName: string) =>
    request<{ success: boolean; userId: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, displayName }),
    }),

  logout: () =>
    request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  getMe: () =>
    request<{ user: any | null }>("/api/auth/me"),

  // Posts
  getPosts: () =>
    request<{ posts: any[] }>("/api/posts"),

  createPost: (content: string, tags: string[] = [], media: { type: string; url: string }[] = []) =>
    request<{ post: any }>("/api/posts", {
      method: "POST",
      body: JSON.stringify({ content, tags, media }),
    }),

  uploadFile: async (file: File): Promise<{ url: string; type: string }> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: formData, credentials: "include" })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "上传失败")
    return data
  },

  toggleLike: (postId: string) =>
    request<{ liked: boolean }>(`/api/posts/${postId}/like`, { method: "POST" }),

  toggleCommentLike: (commentId: string) =>
    request<{ liked: boolean }>(`/api/comments/${commentId}/like`, { method: "POST" }),

  addComment: (postId: string, content: string) =>
    request<{ comment: any }>(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  // Users
  getUsers: () =>
    request<{ users: any[] }>("/api/users"),

  getUser: (id: string) =>
    request<{ user: any }>(`/api/users/${id}`),

  toggleFollow: (userId: string) =>
    request<{ following: boolean }>(`/api/users/${userId}/follow`, { method: "POST" }),

  // Conversations
  getConversations: () =>
    request<{ conversations: any[] }>("/api/conversations"),

  sendMessage: (convId: string, content: string) =>
    request<{ message: any }>(`/api/conversations/${convId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: any[] }>("/api/notifications"),

  markNotificationsRead: () =>
    request<{ success: boolean }>("/api/notifications", { method: "PATCH" }),
}
