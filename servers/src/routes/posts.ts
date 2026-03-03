import Router from "koa-router"
import { queryAll, queryOne, execute } from "../db.js"
import { formatPost } from "../queries.js"
import { requireAuth } from "../middleware/auth.js"

const router = new Router({ prefix: "/api/posts" })

// GET /api/posts
router.get("/", async (ctx) => {
  const rows = await queryAll("SELECT * FROM posts ORDER BY created_at DESC")
  const posts = await Promise.all(rows.map((row: any) => formatPost(row)))
  ctx.body = { posts }
})

// POST /api/posts
router.post("/", requireAuth, async (ctx) => {
  const user = ctx.state.user
  const { content, tags, media } = ctx.request.body as any
  if (!content?.trim()) { ctx.status = 400; ctx.body = { error: "内容不能为空" }; return }

  const now = new Date().toISOString()
  const { lastId } = await execute(
    "INSERT INTO posts (author_id, content, repost_count, created_at) VALUES (?, ?, 0, ?)",
    [Number(user.id), content.trim(), now]
  )
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (typeof tag === "string" && tag.trim()) {
        await execute("INSERT INTO post_tags (post_id, tag) VALUES (?, ?)", [lastId, tag.trim()])
      }
    }
  }
  if (Array.isArray(media)) {
    for (const m of media) {
      if (m && typeof m.url === "string" && typeof m.type === "string") {
        await execute("INSERT INTO post_media (post_id, type, url) VALUES (?, ?, ?)", [lastId, m.type, m.url])
      }
    }
  }
  const row = await queryOne("SELECT * FROM posts WHERE id = ?", [lastId])
  ctx.body = { post: await formatPost(row) }
})

// POST /api/posts/:id/like
router.post("/:id/like", requireAuth, async (ctx) => {
  const user = ctx.state.user
  const postId = Number(ctx.params.id)
  const userId = Number(user.id)

  const existing = await queryOne(
    "SELECT id FROM likes WHERE target_type = 'post' AND target_id = ? AND user_id = ?", [postId, userId]
  )
  if (existing) {
    await execute("DELETE FROM likes WHERE target_type = 'post' AND target_id = ? AND user_id = ?", [postId, userId])
    ctx.body = { liked: false }
  } else {
    await execute("INSERT INTO likes (target_type, target_id, user_id, created_at) VALUES ('post', ?, ?, ?)",
      [postId, userId, new Date().toISOString()])
    const post = await queryOne("SELECT author_id FROM posts WHERE id = ?", [postId])
    if (post && post.author_id !== userId) {
      await execute("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES ('like', ?, ?, ?, 0, ?)",
        [post.author_id, userId, postId, new Date().toISOString()])
    }
    ctx.body = { liked: true }
  }
})

// POST /api/posts/:id/comments
router.post("/:id/comments", requireAuth, async (ctx) => {
  const user = ctx.state.user
  const postId = Number(ctx.params.id)
  const { content } = ctx.request.body as any
  if (!content?.trim()) { ctx.status = 400; ctx.body = { error: "评论不能为空" }; return }

  const now = new Date().toISOString()
  const userId = Number(user.id)
  const { lastId } = await execute(
    "INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?)",
    [postId, userId, content.trim(), now]
  )
  const post = await queryOne("SELECT author_id FROM posts WHERE id = ?", [postId])
  if (post && post.author_id !== userId) {
    await execute("INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES ('comment', ?, ?, ?, 0, ?)",
      [post.author_id, userId, postId, now])
  }
  ctx.body = {
    comment: { id: String(lastId), authorId: user.id, postId: String(postId), content: content.trim(), createdAt: now, likes: [] },
  }
})

export default router
