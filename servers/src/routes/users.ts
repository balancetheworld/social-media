import Router from "koa-router"
import { queryAll, queryOne, execute } from "../db.js"
import { formatUser } from "../queries.js"
import { requireAuth } from "../middleware/auth.js"

const router = new Router({ prefix: "/api/users" })

// GET /api/users
router.get("/", async (ctx) => {
  const rows = await queryAll("SELECT * FROM users ORDER BY id ASC")
  const users = await Promise.all(rows.map((row: any) => formatUser(row)))
  ctx.body = { users }
})

// GET /api/users/:id
router.get("/:id", async (ctx) => {
  const row = await queryOne("SELECT * FROM users WHERE id = ?", [Number(ctx.params.id)])
  if (!row) { ctx.status = 404; ctx.body = { error: "用户不存在" }; return }
  ctx.body = { user: await formatUser(row) }
})

// POST /api/users/:id/follow
router.post("/:id/follow", requireAuth, async (ctx) => {
  const user = ctx.state.user
  const targetId = Number(ctx.params.id)
  const currentId = Number(user.id)
  if (targetId === currentId) { ctx.status = 400; ctx.body = { error: "不能关注自己" }; return }

  const existing = await queryOne(
    "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?", [currentId, targetId]
  )
  if (existing) {
    await execute("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [currentId, targetId])
    ctx.body = { following: false }
  } else {
    await execute("INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)",
      [currentId, targetId, new Date().toISOString()])
    await execute("INSERT INTO notifications (type, to_user_id, from_user_id, is_read, created_at) VALUES ('follow', ?, ?, 0, ?)",
      [targetId, currentId, new Date().toISOString()])
    ctx.body = { following: true }
  }
})

export default router
