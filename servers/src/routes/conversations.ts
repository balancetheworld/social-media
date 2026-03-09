/**
 * Conversations Controller
 * 负责处理私信会话相关的 HTTP 请求
 * 职责：解析请求、调用 Service、返回响应
 */

import Router from 'koa-router'
import * as ConversationService from '../services/conversation.service.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/conversations' })

/**
 * GET /api/conversations
 * 获取用户的所有会话（需要登录）
 */
router.get('/', requireAuth, async (ctx) => {
  const userId = Number(ctx.state.user.id)
  const conversations = await ConversationService.getUserConversations(userId)
  // 按最后活跃时间排序
  conversations.sort((a, b) =>
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  )
  ctx.body = { conversations }
})

/**
 * GET /api/conversations/:id
 * 获取会话详情（需要登录）
 */
router.get('/:id', requireAuth, async (ctx) => {
  const convId = Number(ctx.params.id)
  const conversation = await ConversationService.getConversation(convId)

  if (!conversation) {
    ctx.status = 404
    ctx.body = { error: '会话不存在' }
    return
  }

  ctx.body = { conversation }
})

/**
 * POST /api/conversations
 * 创建或获取与指定用户的会话（需要登录）
 */
router.post('/', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const { userId } = ctx.request.body as any

  // 检查用户权限
  if (!user.can_send_message) {
    ctx.status = 403
    ctx.body = { error: '您已被禁止发送私信' }
    return
  }

  // 检查用户状态
  if (user.status === 'suspended') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被禁言，无法发送私信' }
    return
  }
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封禁' }
    return
  }

  if (!userId) {
    ctx.status = 400
    ctx.body = { error: '请指定用户' }
    return
  }

  const targetUserId = Number(userId)
  const currentUserId = Number(user.id)

  if (targetUserId === currentUserId) {
    ctx.status = 400
    ctx.body = { error: '不能与自己创建会话' }
    return
  }

  try {
    const conversation = await ConversationService.getOrCreateConversation(currentUserId, targetUserId)
    ctx.body = { conversation }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * POST /api/conversations/:id/messages
 * 发送消息（需要登录）
 */
router.post('/:id/messages', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const convId = Number(ctx.params.id)
  const { content } = ctx.request.body as any

  // 检查用户权限
  if (!user.can_send_message) {
    ctx.status = 403
    ctx.body = { error: '您已被禁止发送私信' }
    return
  }

  // 检查用户状态
  if (user.status === 'suspended') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被禁言，无法发送私信' }
    return
  }
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封禁' }
    return
  }

  try {
    const message = await ConversationService.sendMessage({
      conversationId: convId,
      senderId: Number(user.id),
      content,
    })
    ctx.body = { message }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * POST /api/conversations/:id/read
 * 标记会话为已读（需要登录）
 */
router.post('/:id/read', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const convId = Number(ctx.params.id)

  await ConversationService.markConversationRead(convId, Number(user.id))
  ctx.body = { success: true }
})

export default router
