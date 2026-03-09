/**
 * Admin Users Controller
 * 负责处理管理员用户管理相关的 HTTP 请求
 * 职责：管理员可以查看用户、修改用户状态和权限
 */

import Router from 'koa-router'
import * as UserService from '../services/user.service.js'
import * as UserRepo from '../repositories/user.repository.js'
import { requireAdmin } from '../middleware/admin.js'
import { execute, queryAll } from '../db.js'
import type { UserStatus } from '../models/types.js'

const router = new Router({ prefix: '/api/admin/users' })

/**
 * GET /api/admin/users
 * 获取所有用户列表（管理员专用）
 * 支持搜索和分页
 */
router.get('/', requireAdmin, async (ctx) => {
  const { page = '1', limit = '20', search } = ctx.query

  try {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const offset = (pageNum - 1) * limitNum

    // 获取所有用户
    let sql = 'SELECT * FROM users ORDER BY id DESC'
    const users = await queryAll(sql)

    // 格式化用户数据
    const formattedUsers = await Promise.all(
      users.map(async (u: any) => {
        const fullUser = await UserService.getUserById(u.id)
        return {
          id: String(u.id),
          username: u.username,
          displayName: u.display_name,
          avatar: u.avatar,
          bio: u.bio,
          location: u.location,
          verified: !!u.verified,
          coverImage: u.cover_image,
          createdAt: u.created_at,
          role: u.role || 'user',
          status: u.status || 'active',
          canPost: !!u.can_post,
          canComment: !!u.can_comment,
          canSendMessage: !!u.can_send_message,
          followers: fullUser?.followers.map(id => String(id)) || [],
          following: fullUser?.following.map(id => String(id)) || [],
        }
      })
    )

    // 如果有搜索关键词，进行过滤
    let filteredUsers = formattedUsers
    if (search) {
      const searchLower = String(search).toLowerCase()
      filteredUsers = formattedUsers.filter((u: any) =>
        u.username?.toLowerCase().includes(searchLower) ||
        u.displayName?.toLowerCase().includes(searchLower)
      )
    }

    // 分页
    const total = filteredUsers.length
    const paginatedUsers = filteredUsers.slice(offset, offset + limitNum)

    ctx.body = {
      users: paginatedUsers,
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
 * GET /api/admin/users/:id
 * 获取用户详情（管理员专用）
 */
router.get('/:id', requireAdmin, async (ctx) => {
  const userId = Number(ctx.params.id)

  try {
    const userRow = await UserRepo.findById(userId)
    if (!userRow) {
      ctx.status = 404
      ctx.body = { error: '用户不存在' }
      return
    }

    const fullUser = await UserService.getUserById(userId)

    ctx.body = {
      id: String(userRow.id),
      username: userRow.username,
      displayName: userRow.display_name,
      avatar: userRow.avatar,
      bio: userRow.bio,
      location: userRow.location,
      verified: !!userRow.verified,
      coverImage: userRow.cover_image,
      createdAt: userRow.created_at,
      role: userRow.role || 'user',
      status: userRow.status || 'active',
      canPost: !!userRow.can_post,
      canComment: !!userRow.can_comment,
      canSendMessage: !!userRow.can_send_message,
      followers: fullUser?.followers.map(id => String(id)) || [],
      following: fullUser?.following.map(id => String(id)) || [],
    }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * PUT /api/admin/users/:id/status
 * 修改用户状态（管理员专用）
 * body: { status: 'suspended' | 'banned' | 'active' }
 */
router.put('/:id/status', requireAdmin, async (ctx) => {
  const userId = Number(ctx.params.id)
  const { status } = ctx.request.body as any

  // 验证状态值
  const validStatuses: UserStatus[] = ['active', 'suspended', 'banned']
  if (!status || !validStatuses.includes(status)) {
    ctx.status = 400
    ctx.body = { error: '无效的状态值' }
    return
  }

  try {
    const user = await UserRepo.findById(userId)
    if (!user) {
      ctx.status = 404
      ctx.body = { error: '用户不存在' }
      return
    }

    // 更新用户状态
    await execute(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    )

    ctx.body = { success: true, status }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * PUT /api/admin/users/:id/permissions
 * 修改用户权限（管理员专用）
 * body: { can_post, can_comment, can_send_message }
 */
router.put('/:id/permissions', requireAdmin, async (ctx) => {
  const userId = Number(ctx.params.id)
  const { can_post, can_comment, can_send_message } = ctx.request.body as any

  try {
    const user = await UserRepo.findById(userId)
    if (!user) {
      ctx.status = 404
      ctx.body = { error: '用户不存在' }
      return
    }

    // 更新用户权限
    await execute(
      'UPDATE users SET can_post = ?, can_comment = ?, can_send_message = ? WHERE id = ?',
      [can_post ? 1 : 0, can_comment ? 1 : 0, can_send_message ? 1 : 0, userId]
    )

    ctx.body = {
      success: true,
      permissions: {
        canPost: !!can_post,
        canComment: !!can_comment,
        canSendMessage: !!can_send_message,
      },
    }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

/**
 * DELETE /api/admin/users/:id
 * 删除用户（管理员专用）
 */
router.delete('/:id', requireAdmin, async (ctx) => {
  const userId = Number(ctx.params.id)

  try {
    const user = await UserRepo.findById(userId)
    if (!user) {
      ctx.status = 404
      ctx.body = { error: '用户不存在' }
      return
    }

    // 删除用户（级联删除相关数据）
    await execute('DELETE FROM users WHERE id = ?', [userId])

    ctx.body = { success: true }
  } catch (error: any) {
    ctx.status = 400
    ctx.body = { error: error.message }
  }
})

export default router
