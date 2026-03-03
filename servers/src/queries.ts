import { queryAll, queryOne } from "./db.js"

// Convert a raw DB user row to API format
export async function formatUser(row: any) {
  const followers = (await queryAll("SELECT follower_id FROM follows WHERE following_id = ?", [row.id]))
    .map((f: any) => String(f.follower_id))

  const following = (await queryAll("SELECT following_id FROM follows WHERE follower_id = ?", [row.id]))
    .map((f: any) => String(f.following_id))

  return {
    id: String(row.id),
    name: row.display_name,
    handle: row.username,
    avatar: row.avatar || "",
    bio: row.bio || "",
    location: row.location || "",
    joinDate: row.created_at,
    verified: !!row.verified,
    coverImage: row.cover_image || "",
    followers,
    following,
  }
}

// Convert a raw DB post row to API format
export async function formatPost(row: any) {
  const likes = (await queryAll("SELECT user_id FROM likes WHERE target_type = 'post' AND target_id = ?", [row.id]))
    .map((l: any) => String(l.user_id))

  const tags = (await queryAll("SELECT tag FROM post_tags WHERE post_id = ?", [row.id]))
    .map((t: any) => t.tag as string)

  const media = (await queryAll("SELECT type, url FROM post_media WHERE post_id = ?", [row.id]))
    .map((m: any) => ({ type: m.type, url: m.url }))

  const rawComments = await queryAll("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC", [row.id])

  const comments = await Promise.all(
    rawComments.map(async (c: any) => {
      const commentLikes = (await queryAll("SELECT user_id FROM likes WHERE target_type = 'comment' AND target_id = ?", [c.id]))
        .map((l: any) => String(l.user_id))

      return {
        id: String(c.id),
        authorId: String(c.author_id),
        postId: String(c.post_id),
        content: c.content,
        createdAt: c.created_at,
        likes: commentLikes,
      }
    })
  )

  return {
    id: String(row.id),
    authorId: String(row.author_id),
    content: row.content,
    images: [] as string[],
    createdAt: row.created_at,
    likes,
    repostCount: row.repost_count || 0,
    comments,
    bookmarks: [] as string[],
    tags,
    media,
  }
}

export async function formatConversation(convId: number) {
  const participants = (await queryAll("SELECT user_id FROM conversation_participants WHERE conversation_id = ?", [convId]))
    .map((p: any) => String(p.user_id))

  const rawMessages = await queryAll("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", [convId])

  const messages = rawMessages.map((m: any) => ({
    id: String(m.id),
    senderId: String(m.sender_id),
    content: m.content,
    createdAt: m.created_at,
    read: !!m.is_read,
  }))

  const lastMsg = rawMessages[rawMessages.length - 1]

  return {
    id: String(convId),
    participants,
    messages,
    lastActivity: lastMsg?.created_at || new Date().toISOString(),
  }
}

export function formatNotification(row: any) {
  return {
    id: String(row.id),
    type: row.type,
    fromUserId: String(row.from_user_id),
    postId: row.post_id ? String(row.post_id) : undefined,
    createdAt: row.created_at,
    read: !!row.is_read,
  }
}
