/**
 * Posts Controller
 * 负责处理帖子相关的 HTTP 请求
 * 职责：解析请求、调用 Service、返回响应
 */

import Router from 'koa-router'
import * as PostService from '../services/post.service.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/posts' })

/**
 * GET /api/posts
 * 获取所有帖子列表
 */
router.get('/', async (ctx) => {
  const posts = await PostService.getAllPosts()
  ctx.body = { posts }
})

/**
 * POST /api/posts
 * 发布新帖子（需要登录）
 */
router.post('/', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const { content, tags, media } = ctx.request.body as any

  // 检查用户权限
  if (!user.canPost) {
    ctx.status = 403
    ctx.body = { error: '您已被禁止发帖' }
    return
  }

  // 检查用户状态
  if (user.status === 'suspended') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被禁言，无法发帖' }
    return
  }
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封禁' }
    return
  }

  try {
    const post = await PostService.createPost({
      authorId: Number(user.id),
      content,
      tags,
      media,
    })
    ctx.body = { post }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * POST /api/posts/:id/like
 * 帖子点赞/取消点赞（需要登录）
 */
router.post('/:id/like', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const postId = Number(ctx.params.id)

  // 检查账号状态 - 只有封号用户无法点赞
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封号，无法进行此操作' }
    return
  }

  try {
    const result = await PostService.togglePostLike(postId, Number(user.id))
    ctx.body = result
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * POST /api/posts/:id/comments
 * 发布帖子评论（需要登录）
 */
router.post('/:id/comments', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const postId = Number(ctx.params.id)
  const { content } = ctx.request.body as any

  // 检查用户权限
  if (!user.canComment) {
    ctx.status = 403
    ctx.body = { error: '您已被禁止评论' }
    return
  }

  // 检查用户状态
  if (user.status === 'suspended') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被禁言，无法评论' }
    return
  }
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封禁' }
    return
  }

  try {
    const comment = await PostService.addComment({
      postId,
      authorId: Number(user.id),
      content,
    })
    ctx.body = { comment }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * DELETE /api/posts/:id
 * 删除帖子（需要登录，需要是作者本人）
 */
router.delete('/:id', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const postId = Number(ctx.params.id)

  try {
    await PostService.deletePost(postId, Number(user.id))
    ctx.body = { success: true }
  } catch (error: any) {
    if (error.message === '帖子不存在') {
      ctx.status = 404
      ctx.body = { error: error.message }
    } else if (error.message === '没有权限删除此帖子') {
      ctx.status = 403
      ctx.body = { error: error.message }
    } else {
      ctx.status = 400
      ctx.body = { error: error.message }
    }
  }
})

export default router
