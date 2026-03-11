"use client"

import { useState } from "react"
import { X, Shield, Ban, Check, AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"

interface AdminUser {
  id: string
  username: string
  displayName: string
  avatar: string
  role: string
  status: string
  canPost: boolean
  canComment: boolean
  canSendMessage: boolean
}

interface UserActionsDialogProps {
  user: AdminUser
  open: boolean
  onClose: () => void
  onUpdate: () => void
}

export function UserActionsDialog({ user, open, onClose, onUpdate }: UserActionsDialogProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (status: "active" | "suspended" | "banned") => {
    if (!confirm(`确认将用户状态更改为 "${getStatusText(status)}"？`)) return

    try {
      setLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/users/${user.id}/status`
      console.log(`正在修改状态: 用户ID=${user.id}, 状态=${status}, API URL=${apiUrl}`)
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      console.log(`状态修改响应: status=${res.status}, ok=${res.ok}`)

      if (res.ok) {
        const data = await res.json()
        console.log('状态修改成功:', data)
        onUpdate()
      } else {
        const errorData = await res.json()
        console.error('状态修改失败:', errorData)
        alert(`操作失败: ${errorData.error || res.statusText}`)
      }
    } catch (error) {
      console.error('状态修改异常:', error)
      alert(`操作失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async () => {
    try {
      setLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/users/${user.id}/permissions`
      console.log(`正在修改权限: 用户ID=${user.id}, canPost=${user.canPost}, canComment=${user.canComment}, canSendMessage=${user.canSendMessage}, API URL=${apiUrl}`)
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          can_post: user.canPost,
          can_comment: user.canComment,
          can_send_message: user.canSendMessage,
        }),
      })

      console.log(`权限修改响应: status=${res.status}, ok=${res.ok}`)

      if (res.ok) {
        const data = await res.json()
        console.log('权限修改成功:', data)
        onUpdate()
      } else {
        const errorData = await res.json()
        console.error('权限修改失败:', errorData)
        alert(`操作失败: ${errorData.error || res.statusText}`)
      }
    } catch (error) {
      console.error('权限修改异常:', error)
      alert(`操作失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "banned": return "封号"
      case "suspended": return "禁言"
      default: return "正常"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "banned": return "text-destructive"
      case "suspended": return "text-yellow-600 dark:text-yellow-500"
      default: return "text-green-600 dark:text-green-500"
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card border shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">用户管理</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 用户信息 */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-muted/50">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{user.displayName}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
          {user.role === "admin" && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
              <Shield className="h-3 w-3" />
              管理员
            </span>
          )}
        </div>

        {/* 当前状态 */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">当前状态</div>
          <div className={`font-semibold ${getStatusColor(user.status)}`}>
            {getStatusText(user.status)}
          </div>
        </div>

        {/* 状态操作 */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-3">状态操作</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStatusChange("active")}
              disabled={loading || user.status === "active"}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors hover:bg-green-500/10 hover:border-green-500/50 disabled:opacity-50"
            >
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-xs">恢复正常</span>
            </button>
            <button
              onClick={() => handleStatusChange("suspended")}
              disabled={loading || user.status === "suspended"}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors hover:bg-yellow-500/10 hover:border-yellow-500/50 disabled:opacity-50"
            >
              <Ban className="h-5 w-5 text-yellow-600" />
              <span className="text-xs">禁言</span>
            </button>
            <button
              onClick={() => handleStatusChange("banned")}
              disabled={loading || user.status === "banned"}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors hover:bg-destructive/10 hover:border-destructive/50 disabled:opacity-50"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-xs">封号</span>
            </button>
          </div>
        </div>

        {/* 权限设置 */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-3">权限设置</div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={user.canPost}
                onChange={(e) => {
                  user.canPost = e.target.checked
                  handlePermissionChange()
                }}
                disabled={loading}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium">允许发帖</div>
                <div className="text-xs text-muted-foreground">用户可以发布新帖子</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={user.canComment}
                onChange={(e) => {
                  user.canComment = e.target.checked
                  handlePermissionChange()
                }}
                disabled={loading}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium">允许评论</div>
                <div className="text-xs text-muted-foreground">用户可以评论帖子</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={user.canSendMessage}
                onChange={(e) => {
                  user.canSendMessage = e.target.checked
                  handlePermissionChange()
                }}
                disabled={loading}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium">允许私信</div>
                <div className="text-xs text-muted-foreground">用户可以发送私信</div>
              </div>
            </label>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          完成
        </button>
      </div>
    </div>
  )
}
