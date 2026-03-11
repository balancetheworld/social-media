/**
 * Auth Service
 * 负责认证相关的业务逻辑
 */

import { createHash, randomBytes, randomInt } from 'crypto'

/**
 * 本地头像资源列表
 */
const localAvatars = [
  '/avatar/avatar1.jpg',
  '/avatar/avatar2.jpg',
  '/avatar/avatar3.jpg',
  '/avatar/avatar4.jpg',
  '/avatar/avatar5.jpg',
  '/avatar/a6.jpg',
  '/avatar/a7.jpg',
  '/avatar/a8.jpg',
  '/avatar/a9.jpg',
  '/avatar/a10.jpg',
  '/avatar/a11.jpg',
  '/avatar/a12.jpg',
]

/**
 * 随机获取一个本地头像
 */
export function getRandomAvatar(): string {
  return localAvatars[randomInt(0, localAvatars.length)]
}
import * as SessionRepo from '../repositories/session.repository.js'
import * as UserRepo from '../repositories/user.repository.js'
import * as UserService from './user.service.js'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/index.js'

const SESSION_DURATION_DAYS = 7

/**
 * 密码哈希
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

/**
 * 生成随机 Token
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * 计算会话过期时间
 */
export function getSessionExpiry(): string {
  return new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()
}

/**
 * 验证密码格式
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 6) {
    return { valid: false, error: '密码至少6个字符' }
  }
  return { valid: true }
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  // 验证输入
  if (!data.username || !data.password) {
    return { success: false, error: '请输入用户名和密码' }
  }

  // 查找用户
  const user = await UserRepo.findByUsername(data.username)
  if (!user) {
    return { success: false, error: '用户名或密码错误' }
  }

  // 验证密码
  const passwordHash = hashPassword(data.password)
  if (user.password_hash !== passwordHash) {
    return { success: false, error: '用户名或密码错误' }
  }

  // 检查账号状态 - 只有封号用户无法登录
  if (user.status === 'banned') {
    return { success: false, error: '您的账号已被封号，无法登录' }
  }

  // 创建会话
  const token = generateToken()
  const expiresAt = getSessionExpiry()
  await SessionRepo.create({ token, userId: user.id, expiresAt })

  // 获取完整用户信息
  const fullUser = await UserService.getUserById(user.id)

  return {
    success: true,
    userId: String(user.id),
    user: fullUser || undefined,
  }
}

/**
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  // 验证输入
  if (!data.username || !data.password || !data.displayName) {
    return { success: false, error: '请填写所有字段' }
  }

  // 验证用户名
  const usernameValidation = UserService.validateUsername(data.username)
  if (!usernameValidation.valid) {
    return { success: false, error: usernameValidation.error }
  }

  // 验证密码
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }

  // 检查用户名是否存在
  if (await UserRepo.usernameExists(data.username)) {
    return { success: false, error: '用户名已存在' }
  }

  // 随机选择本地头像
  const avatar = getRandomAvatar()

  // 创建用户
  const passwordHash = hashPassword(data.password)
  const userId = await UserRepo.create({
    username: data.username,
    passwordHash,
    displayName: data.displayName,
    avatar,
  })

  // 创建会话
  const token = generateToken()
  const expiresAt = getSessionExpiry()
  await SessionRepo.create({ token, userId, expiresAt })

  // 获取完整用户信息
  const fullUser = await UserService.getUserById(userId)

  return {
    success: true,
    userId: String(userId),
    user: fullUser || undefined,
  }
}

/**
 * 用户登出
 */
export async function logout(token: string): Promise<void> {
  if (token) {
    await SessionRepo.deleteByToken(token)
  }
}

/**
 * 根据 Token 获取用户信息
 */
export async function getUserByToken(token: string): Promise<User | null> {
  // 清理过期会话
  await SessionRepo.deleteExpired()

  // 查找有效会话
  const session = await SessionRepo.findValidByToken(token)
  if (!session) return null

  // 获取用户信息
  const user = await UserService.getUserById(session.user_id)
  return user
}

/**
 * 验证 Token 并返回用户 ID
 */
export async function validateToken(token: string): Promise<number | null> {
  const session = await SessionRepo.findValidByToken(token)
  return session?.user_id || null
}

/**
 * 获取用户的当前 Token（用于登录/注册后返回）
 */
export async function getUserToken(userId: number): Promise<string | null> {
  const sessions = await SessionRepo.findByUserId(userId)
  // 返回最新的会话 token
  return sessions.length > 0 ? sessions[0].token : null
}

// 导出常量
export const SESSION_COOKIE = 'session_token'
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  overwrite: true,
}
