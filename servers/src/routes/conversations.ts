import Router from "koa-router"
import { queryAll, execute } from "../db.js"
import { formatConversation } from "../queries.js"
import { requireAuth } from "../middleware/auth.js"

const router = new Router({ prefix: "/api/conversations" })

// GET /api/conversations
router.get("/", requireAuth, async (ctx) => {
  const userId = Number(ctx.state.user.id)
  const convRows = await queryAll("SELECT conversation_id FROM conversation_participants WHERE user_id = ?", [userId])
  const conversations = await Promise.all(convRows.map((row: any) => formatConversation(row.conversation_id)))
  conversations.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
  ctx.body = { conversations }
})

// POST /api/conversations/:id/messages
router.post("/:id/messages", requireAuth, async (ctx) => {
  const user = ctx.state.user
  const convId = Number(ctx.params.id)
  const { content } = ctx.request.body as any
  if (!content?.trim()) { ctx.status = 400; ctx.body = { error: "消息不能为空" }; return }

  const now = new Date().toISOString()
  const { lastId } = await execute(
    "INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, 1, ?)",
    [convId, Number(user.id), content.trim(), now]
  )
  ctx.body = {
    message: { id: String(lastId), senderId: user.id, content: content.trim(), createdAt: now, read: true },
  }
})

export default router
