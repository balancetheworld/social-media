/**
 * Post Service
 * 负责帖子相关的业务逻辑
 */

import * as PostRepo from '../repositories/post.repository.js'
import * as CommentRepo from '../repositories/comment.repository.js'
import * as LikeRepo from '../repositories/like.repository.js'
import * as UserRepo from '../repositories/user.repository.js'
import * as NotificationRepo from '../repositories/notification.repository.js'
import type { Post, Comment, PostMedia } from '../models/index.js'

/**
 * 格式化帖子数据
 * 将数据库原始数据转换为 API 格式
 */
export async function formatPost(row: any): Promise<Post> {
  const likes = await LikeRepo.getPostLikedUserIds(row.id)
  const tags = await PostRepo.getTags(row.id)
  const media = await PostRepo.getMedia(row.id)
  const rawComments = await CommentRepo.findByPostId(row.id)

  const comments: Comment[] = await Promise.all(
    rawComments.map(async (c) => {
      const commentLikes = await LikeRepo.getCommentLikedUserIds(c.id)
      return {
        id: String(c.id),
        authorId: String(c.author_id),
        postId: String(c.post_id),
        content: c.content,
        createdAt: c.created_at,
        likes: commentLikes.map(id => String(id)),
      }
    })
  )

  return {
    id: String(row.id),
    authorId: String(row.author_id),
    content: row.content,
    images: [],
    createdAt: row.created_at,
    likes: likes.map(id => String(id)),
    repostCount: row.repost_count || 0,
    comments,
    bookmarks: [],
    tags,
    media,
  }
}

/**
 * 获取所有帖子
 */
export async function getAllPosts(): Promise<Post[]> {
  const rows = await PostRepo.findAll('DESC')
  return Promise.all(rows.map(row => formatPost(row)))
}

/**
 * 获取用户的帖子
 */
export async function getUserPosts(userId: number): Promise<Post[]> {
  const rows = await PostRepo.findByAuthorId(userId)
  return Promise.all(rows.map(row => formatPost(row)))
}

/**
 * 根据 ID 获取帖子
 */
export async function getPostById(id: number): Promise<Post | null> {
  const row = await PostRepo.findById(id)
  if (!row) return null
  return await formatPost(row)
}

/**
 * 创建帖子
 */
export async function createPost(data: {
  authorId: number
  content: string
  tags?: string[]
  media?: PostMedia[]
}): Promise<Post> {
  // 验证内容
  if (!data.content?.trim()) {
    throw new Error('内容不能为空')
  }

  // 创建帖子
  const postId = await PostRepo.create({
    authorId: data.authorId,
    content: data.content.trim(),
  })

  // 添加标签
  if (data.tags && Array.isArray(data.tags)) {
    await PostRepo.addTags(postId, data.tags)
  }

  // 添加媒体
  if (data.media && Array.isArray(data.media)) {
    await PostRepo.addMediaList(postId, data.media)
  }

  // 返回完整帖子
  const post = await PostRepo.findById(postId)
  if (!post) {
    throw new Error('帖子创建失败')
  }
  return await formatPost(post)
}

/**
 * 删除帖子
 */
export async function deletePost(postId: number, userId: number): Promise<void> {
  const post = await PostRepo.findById(postId)
  if (!post) {
    throw new Error('帖子不存在')
  }
  if (post.author_id !== userId) {
    throw new Error('没有权限删除此帖子')
  }

  // 清理点赞记录（likes 表没有级联删除）
  await LikeRepo.deleteByTarget('post', postId)

  // 删除帖子（数据库级联删除会删除相关评论、标签、媒体）
  await PostRepo.deleteById(postId)
}

/**
 * 管理员删除帖子（不检查作者）
 */
export async function adminDeletePost(postId: number): Promise<void> {
  const post = await PostRepo.findById(postId)
  if (!post) {
    throw new Error('帖子不存在')
  }

  // 清理点赞记录
  await LikeRepo.deleteByTarget('post', postId)

  // 删除帖子
  await PostRepo.deleteById(postId)
}

/**
 * 帖子点赞/取消点赞
 */
export async function togglePostLike(postId: number, userId: number): Promise<{ liked: boolean }> {
  const existing = await LikeRepo.findByTargetAndUser('post', postId, userId)

  if (existing) {
    // 取消点赞
    await LikeRepo.deleteByTargetAndUser('post', postId, userId)
    return { liked: false }
  }

  // 点赞
  await LikeRepo.create({ targetType: 'post', targetId: postId, userId })

  // 发送通知（如果点赞的不是作者自己）
  const post = await PostRepo.findById(postId)
  if (post && post.author_id !== userId) {
    await NotificationRepo.create({
      type: 'like',
      toUserId: post.author_id,
      fromUserId: userId,
      postId: postId,
    })
  }

  return { liked: true }
}

/**
 * 添加评论
 */
export async function addComment(data: {
  postId: number
  authorId: number
  content: string
}): Promise<Comment> {
  // 验证内容
  if (!data.content?.trim()) {
    throw new Error('评论不能为空')
  }

  // 创建评论
  const commentId = await CommentRepo.create({
    postId: data.postId,
    authorId: data.authorId,
    content: data.content.trim(),
  })

  // 发送通知（如果评论的不是作者自己）
  const post = await PostRepo.findById(data.postId)
  if (post && post.author_id !== data.authorId) {
    await NotificationRepo.create({
      type: 'comment',
      toUserId: post.author_id,
      fromUserId: data.authorId,
      postId: data.postId,
    })
  }

  // 返回格式化后的评论
  const comment = await CommentRepo.findById(commentId)
  if (!comment) {
    throw new Error('评论创建失败')
  }
  const likes = await LikeRepo.getCommentLikedUserIds(commentId)

  return {
    id: String(comment.id),
    authorId: String(comment.author_id),
    postId: String(comment.post_id),
    content: comment.content,
    createdAt: comment.created_at,
    likes: likes.map(id => String(id)),
  }
}

/**
 * 评论点赞/取消点赞
 */
export async function toggleCommentLike(commentId: number, userId: number): Promise<{ liked: boolean }> {
  const existing = await LikeRepo.findByTargetAndUser('comment', commentId, userId)

  if (existing) {
    await LikeRepo.deleteByTargetAndUser('comment', commentId, userId)
    return { liked: false }
  }

  await LikeRepo.create({ targetType: 'comment', targetId: commentId, userId })
  return { liked: true }
}
