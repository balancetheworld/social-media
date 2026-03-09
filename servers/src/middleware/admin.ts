/**
 * Admin Middleware
 * 负责检查用户是否为管理员的中间件
 */

import type { Context, Next } from 'koa'

/**
 * 管理员权限守卫中间件
 * 如果用户不是管理员，返回 403 错误
 */
export async function requireAdmin(ctx: Context, next: Next) {
  if (!ctx.state.user) {
    ctx.status = 401
    ctx.body = { error: '未登录' }
    return
  }

  if (ctx.state.user.role !== 'admin') {
    ctx.status = 403
    ctx.body = { error: '需要管理员权限' }
    return
  }

  await next()
}
