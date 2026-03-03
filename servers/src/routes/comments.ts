import Router from "koa-router"
import { queryOne, execute } from "../db.js"
import { requireAuth } from "../middleware/auth.js"

const router = new Router({ prefix: "/api/comments" })

// POST /api/comments/:id/like
router.post("/:id/like", requireAuth, async (ctx) => {
  const userId = Number(ctx.state.user.id)
  const commentId = Number(ctx.params.id)

  const existing = await queryOne(
    "SELECT id FROM likes WHERE target_type = 'comment' AND target_id = ? AND user_id = ?", [commentId, userId]
  )
  if (existing) {
    await execute("DELETE FROM likes WHERE target_type = 'comment' AND target_id = ? AND user_id = ?", [commentId, userId])
    ctx.body = { liked: false }
  } else {
    await execute("INSERT INTO likes (target_type, target_id, user_id, created_at) VALUES ('comment', ?, ?, ?)",
      [commentId, userId, new Date().toISOString()])
    ctx.body = { liked: true }
  }
})

export default router
