import { createHash, randomBytes } from "crypto"
import { queryOne, execute } from "./db.js"

const SESSION_DURATION_DAYS = 7

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()
  await execute(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    [token, userId, expiresAt]
  )
  return token
}

export async function getUserByToken(token: string) {
  await execute("DELETE FROM sessions WHERE expires_at < ?", [new Date().toISOString()])
  const session = await queryOne(
    "SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?",
    [token, new Date().toISOString()]
  )
  if (!session) return null
  const user = await queryOne(
    "SELECT id, username, display_name, avatar, bio, location, verified, cover_image, created_at FROM users WHERE id = ?",
    [session.user_id]
  )
  if (!user) return null
  return {
    id: String(user.id),
    name: user.display_name,
    handle: user.username,
    avatar: user.avatar || "",
    bio: user.bio || "",
    location: user.location || "",
    joinDate: user.created_at,
    verified: !!user.verified,
    coverImage: user.cover_image || "",
  }
}

export const SESSION_COOKIE = "session_token"
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  overwrite: true,
}
