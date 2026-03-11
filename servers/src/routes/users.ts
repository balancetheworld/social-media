/**
 * Users Controller
 * 负责处理用户相关的 HTTP 请求
 * 职责：解析请求、调用 Service、返回响应
 */

import Router from 'koa-router'
import * as UserService from '../services/user.service.js'
import * as NotificationService from '../services/notification.service.js'
import * as PostService from '../services/post.service.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/users' })

/**
 * GET /api/users
 * 获取所有用户列表
 */
router.get('/', async (ctx) => {
  // TODO: 添加分页支持
  const users = await UserService.getAllUsers()
  ctx.body = { users }
})

/**
 * GET /api/users/:id
 * 获取用户详情
 */
router.get('/:id', async (ctx) => {
  const userId = Number(ctx.params.id)

  const user = await UserService.getUserById(userId)
  if (!user) {
    ctx.status = 404
    ctx.body = { error: '用户不存在' }
    return
  }

  ctx.body = { user }
})

/**
 * POST /api/users/:id/follow
 * 关注/取消关注用户（需要登录）
 */
router.post('/:id/follow', requireAuth, async (ctx) => {
  const user = ctx.state.user
  const targetId = Number(ctx.params.id)
  const currentId = Number(user.id)

  // 检查账号状态 - 只有封号用户无法关注
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = { error: '您的账号已被封号，无法进行此操作' }
    return
  }

  // 不能关注自己
  if (targetId === currentId) {
    ctx.status = 400
    ctx.body = { error: '不能关注自己' }
    return
  }

  const isFollowing = await UserService.isUserFollowing(currentId, targetId)

  if (isFollowing) {
    // 取消关注
    await UserService.unfollowUser(currentId, targetId)
    ctx.body = { following: false }
  } else {
    // 关注用户
    await UserService.followUser(currentId, targetId)
    // 发送关注通知
    await NotificationService.createFollowNotification(targetId, currentId)
    ctx.body = { following: true }
  }
})

/**
 * GET /api/users/:id/followers
 * 获取用户的关注者列表
 */
router.get('/:id/followers', requireAuth, async (ctx) => {
  const userId = Number(ctx.params.id)
  const followers = await UserService.getFollowers(userId)
  ctx.body = { users: followers }
})

/**
 * GET /api/users/:id/following
 * 获取用户正在关注的人
 */
router.get('/:id/following', requireAuth, async (ctx) => {
  const userId = Number(ctx.params.id)
  const following = await UserService.getFollowing(userId)
  ctx.body = { users: following }
})

/**
 * GET /api/users/:id/posts
 * 获取用户的帖子
 */
router.get('/:id/posts', async (ctx) => {
  const userId = Number(ctx.params.id)
  const posts = await PostService.getUserPosts(userId)
  ctx.body = { posts }
})

export default router
