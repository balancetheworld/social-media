import type { Context, Next } from "koa"
import { getUserByToken, SESSION_COOKIE } from "../auth.js"

// Adds ctx.state.user if a valid session cookie exists
export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.cookies.get(SESSION_COOKIE)
  if (token) {
    const user = await getUserByToken(token)
    if (user) {
      ctx.state.user = user
    }
  }
  await next()
}

// Guard: returns 401 if not authenticated
export async function requireAuth(ctx: Context, next: Next) {
  if (!ctx.state.user) {
    ctx.status = 401
    ctx.body = { error: "未登录" }
    return
  }
  await next()
}
