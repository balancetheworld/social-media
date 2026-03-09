/**
 * Admin Posts Controller
 * 负责处理管理员帖子管理相关的 HTTP 请求
 * 职责：管理员可以删除任意帖子、获取所有帖子列表
 */

import Router from 'koa-router'
import * as PostService from '../services/post.service.js'
import { requireAdmin } from '../middleware/admin.js'

const router = new Router({ prefix: '/api/admin/posts' })

/**
 * GET /api/admin/posts
 * 获取所有帖子列表（管理员专用）
 * 支持分页和筛选
 */
router.get('/', requireAdmin, async (ctx) => {
  const { page = '1', limit = '20', search } = ctx.query

  try {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const offset = (pageNum - 1) * limitNum

    // 获取所有帖子
    const allPosts = await PostService.getAllPosts()

    // 如果有搜索关键词，进行过滤
    let filteredPosts = allPosts
    if (search) {
      const searchLower = String(search).toLowerCase()
      filteredPosts = allPosts.filter((post: any) =>
        post.content?.toLowerCase().includes(searchLower)
      )
    }

    // 分页
    const total = filteredPosts.length
    const paginatedPosts = filteredPosts.slice(offset, offset + limitNum)

    ctx.body = {
      posts: paginatedPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * DELETE /api/admin/posts/:id
 * 管理员删除任意帖子
 */
router.delete('/:id', requireAdmin, async (ctx) => {
  const postId = Number(ctx.params.id)

  try {
    // 管理员直接删除，不需要检查作者
    await PostService.adminDeletePost(postId)
    ctx.body = { success: true }
  } catch (error: any) {
    if (error.message === '帖子不存在') {
      ctx.status = 404
      ctx.body = { error: error.message }
    } else {
      ctx.status = 400
      ctx.body = { error: error.message }
    }
  }
})

export default router
