/**
 * Authentication Middleware
 * 负责处理认证相关的中间件逻辑
 */

import type { Context, Next } from 'koa'
import * as AuthService from '../services/auth.service.js'

/**
 * 认证中间件
 * 如果存在有效的 session cookie，将用户信息添加到 ctx.state.user
 */
export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.cookies.get(AuthService.SESSION_COOKIE, { signed: true })
  if (token) {
    const user = await AuthService.getUserByToken(token)
    if (user) {
      ctx.state.user = user
    }
  }
  await next()
}

/**
 * 需要登录的守卫中间件
 * 如果用户未登录，返回 401 错误
 */
export async function requireAuth(ctx: Context, next: Next) {
  if (!ctx.state.user) {
    ctx.status = 401
    ctx.body = { error: '未登录' }
    return
  }
  await next()
}
