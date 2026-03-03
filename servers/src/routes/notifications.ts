import Router from "koa-router"
import { queryAll, execute } from "../db.js"
import { formatNotification } from "../queries.js"
import { requireAuth } from "../middleware/auth.js"

const router = new Router({ prefix: "/api/notifications" })

// GET /api/notifications
router.get("/", requireAuth, async (ctx) => {
  const rows = await queryAll("SELECT * FROM notifications WHERE to_user_id = ? ORDER BY created_at DESC", [Number(ctx.state.user.id)])
  const notifications = rows.map((row: any) => formatNotification(row))
  ctx.body = { notifications }
})

// PATCH /api/notifications (mark all read)
router.patch("/", requireAuth, async (ctx) => {
  await execute("UPDATE notifications SET is_read = 1 WHERE to_user_id = ?", [Number(ctx.state.user.id)])
  ctx.body = { success: true }
})

export default router
