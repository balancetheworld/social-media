import Router from "koa-router"
import { queryOne, execute } from "../db.js"
import { hashPassword, createSession, getUserByToken, SESSION_COOKIE, COOKIE_OPTIONS } from "../auth.js"
import { formatUser } from "../queries.js"

const router = new Router({ prefix: "/api/auth" })

// POST /api/auth/login
router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body as any
  if (!username || !password) {
    ctx.status = 400; ctx.body = { error: "请输入用户名和密码" }; return
  }
  const passwordHash = hashPassword(password)
  const user = await queryOne("SELECT id FROM users WHERE username = ? AND password_hash = ?", [username, passwordHash])
  if (!user) {
    ctx.status = 401; ctx.body = { error: "用户名或密码错误" }; return
  }
  const token = await createSession(user.id)
  ctx.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS)
  ctx.body = { success: true, userId: String(user.id) }
})

// POST /api/auth/register
router.post("/register", async (ctx) => {
  const { username, password, displayName } = ctx.request.body as any
  if (!username || !password || !displayName) {
    ctx.status = 400; ctx.body = { error: "请填写所有字段" }; return
  }
  if (username.length < 2) { ctx.status = 400; ctx.body = { error: "用户名至少2个字符" }; return }
  if (password.length < 6) { ctx.status = 400; ctx.body = { error: "密码至少6个字符" }; return }

  const existing = await queryOne("SELECT id FROM users WHERE username = ?", [username])
  if (existing) { ctx.status = 409; ctx.body = { error: "用户名已存在" }; return }

  const passwordHash = hashPassword(password)
  const now = new Date().toISOString()
  const avatarSeed = username.replace(/[^a-zA-Z]/g, "") || "user"
  const avatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`

  const { lastId } = await execute(
    "INSERT INTO users (username, password_hash, display_name, avatar, bio, location, verified, created_at) VALUES (?, ?, ?, ?, '', '', 0, ?)",
    [username, passwordHash, displayName, avatar, now]
  )
  const token = await createSession(lastId)
  ctx.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS)
  const userRow = await queryOne("SELECT * FROM users WHERE id = ?", [lastId])
  const user = userRow ? await formatUser(userRow) : null
  ctx.body = { success: true, userId: String(lastId), user }
})

// POST /api/auth/logout
router.post("/logout", async (ctx) => {
  const token = ctx.cookies.get(SESSION_COOKIE)
  if (token) {
    await execute("DELETE FROM sessions WHERE token = ?", [token])
  }
  ctx.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 })
  ctx.body = { success: true }
})

// GET /api/auth/me
router.get("/me", async (ctx) => {
  const token = ctx.cookies.get(SESSION_COOKIE)
  if (!token) { ctx.body = { user: null }; return }
  const userData = await getUserByToken(token)
  if (!userData) { ctx.body = { user: null }; return }
  const row = await queryOne("SELECT * FROM users WHERE id = ?", [Number(userData.id)])
  if (!row) { ctx.body = { user: null }; return }
  ctx.body = { user: await formatUser(row) }
})

export default router
