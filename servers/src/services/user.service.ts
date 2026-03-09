/**
 * User Service
 * 负责用户相关的业务逻辑
 */

import * as UserRepo from '../repositories/user.repository.js'
import * as FollowRepo from '../repositories/user.repository.js'
import type { User } from '../models/index.js'

/**
 * 格式化用户数据
 * 将数据库原始数据转换为 API 格式
 */
export async function formatUser(row: any): Promise<User> {
  const followers = await FollowRepo.getFollowers(row.id)
  const following = await FollowRepo.getFollowing(row.id)

  return {
    id: String(row.id),
    name: row.display_name,
    handle: row.username,
    avatar: row.avatar || '',
    bio: row.bio || '',
    location: row.location || '',
    joinDate: row.created_at,
    verified: !!row.verified,
    coverImage: row.cover_image || '',
    followers: followers.map(id => String(id)),
    following: following.map(id => String(id)),
    role: row.role || 'user',
    status: row.status || 'active',
    canPost: row.can_post !== 0,
    canComment: row.can_comment !== 0,
    canSendMessage: row.can_send_message !== 0,
  }
}

/**
 * 根据用户名查找用户（带格式化）
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const row = await UserRepo.findById(parseInt(username))
  if (!row) return null
  return await formatUser(row)
}

/**
 * 获取所有用户（带格式化）
 */
export async function getAllUsers(): Promise<User[]> {
  const rows = await UserRepo.findAll()
  return Promise.all(rows.map(row => formatUser(row)))
}

/**
 * 根据 ID 查找用户（带格式化）
 */
export async function getUserById(id: number): Promise<User | null> {
  const row = await UserRepo.findById(id)
  if (!row) return null
  return await formatUser(row)
}

/**
 * 检查用户名是否可用
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  return !(await UserRepo.usernameExists(username))
}

/**
 * 验证用户名格式
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 2) {
    return { valid: false, error: '用户名至少2个字符' }
  }
  return { valid: true }
}

/**
 * 关注用户
 */
export async function followUser(followerId: number, followingId: number): Promise<void> {
  if (followerId === followingId) {
    throw new Error('不能关注自己')
  }
  await FollowRepo.createFollow(followerId, followingId)
}

/**
 * 取消关注
 */
export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  await FollowRepo.deleteFollow(followerId, followingId)
}

/**
 * 检查是否已关注
 */
export async function isUserFollowing(followerId: number, followingId: number): Promise<boolean> {
  return await FollowRepo.isFollowing(followerId, followingId)
}

/**
 * 获取关注者列表（带格式化）
 */
export async function getFollowers(userId: number): Promise<User[]> {
  const followerIds = await FollowRepo.getFollowers(userId)
  if (followerIds.length === 0) return []
  const rows = await UserRepo.findByIds(followerIds)
  return Promise.all(rows.map(row => formatUser(row)))
}

/**
 * 获取正在关注列表（带格式化）
 */
export async function getFollowing(userId: number): Promise<User[]> {
  const followingIds = await FollowRepo.getFollowing(userId)
  if (followingIds.length === 0) return []
  const rows = await UserRepo.findByIds(followingIds)
  return Promise.all(rows.map(row => formatUser(row)))
}

/**
 * 更新用户资料
 */
export async function updateProfile(
  userId: number,
  data: {
    displayName?: string
    bio?: string
    location?: string
  }
): Promise<void> {
  await UserRepo.update(userId, {
    displayName: data.displayName,
    bio: data.bio,
    location: data.location,
  })
}
