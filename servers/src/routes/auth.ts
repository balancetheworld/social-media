/**
 * Auth Controller
 * 负责处理认证相关的 HTTP 请求
 * 职责：解析请求、调用 Service、返回响应
 */

import Router from 'koa-router'
import * as AuthService from '../services/auth.service.js'
import { SESSION_COOKIE, COOKIE_OPTIONS } from '../services/auth.service.js'

const router = new Router({ prefix: '/api/auth' })

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as any

  const result = await AuthService.login({ username, password })

  if (result.success && result.userId) {
    const token = await AuthService.getUserToken(Number(result.userId))
    if (token) {
      ctx.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS)
    }
    ctx.body = {
      success: true,
      userId: result.userId,
      user: result.user,
    }
  } else {
    ctx.status = 401
    ctx.body = { error: result.error || '登录失败' }
  }
})

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (ctx) => {
  const { username, password, displayName } = ctx.request.body as any

  const result = await AuthService.register({ username, password, displayName })

  if (result.success && result.userId) {
    const token = await AuthService.getUserToken(Number(result.userId))
    if (token) {
      ctx.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS)
    }
    ctx.body = {
      success: true,
      userId: result.userId,
      user: result.user,
    }
  } else {
    ctx.status = result.error?.includes('已存在') ? 409 : 400
    ctx.body = { error: result.error || '注册失败' }
  }
})

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', async (ctx) => {
  const token = ctx.cookies.get(SESSION_COOKIE, { signed: true })
  if (token) {
    await AuthService.logout(token)
  }
  ctx.cookies.set(SESSION_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 })
  ctx.body = { success: true }
})

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
router.get('/me', async (ctx) => {
  const token = ctx.cookies.get(SESSION_COOKIE, { signed: true })
  if (!token) {
    ctx.body = { user: null }
    return
  }

  const user = await AuthService.getUserByToken(token)
  ctx.body = { user }
})

export default router
