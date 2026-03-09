/**
 * Comments Controller
 * 负责处理评论相关的 HTTP 请求
 * 职责：解析请求、调用 Service、返回响应
 */

import Router from 'koa-router'
import * as PostService from '../services/post.service.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/comments' })

/**
 * POST /api/comments/:id/like
 * 评论点赞/取消点赞（需要登录）
 */
router.post('/:id/like', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const commentId = Number(ctx.params.id)

  // 检查用户状态
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封禁' }
    return
  }

  try {
    const result = await PostService.toggleCommentLike(commentId, Number(user.id))
    ctx.body = result
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

export default router
