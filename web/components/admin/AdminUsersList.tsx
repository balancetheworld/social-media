"use client"

import { useState, useEffect } from "react"
import { Search, Shield, Ban, MessageSquare, Edit3, Lock, Unlock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSocial } from "@/lib/social-context"
import { UserActionsDialog } from "./UserActionsDialog"

interface AdminUser {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  role: string
  status: string
  canPost: boolean
  canComment: boolean
  canSendMessage: boolean
  createdAt: string
}

export function AdminUsersList() {
  const t = useTranslations()
  const { currentUser } = useSocial()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 检查是否是 admin1 账号
  const isAdmin1 = currentUser?.username === 'admin1'

  const loadUsers = async () => {
    try {
      setLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/users`
      console.log('正在加载用户，API URL:', apiUrl)
      const res = await fetch(apiUrl, {
        credentials: "include",
      })
      console.log('API 响应状态:', res.status, res.statusText)

      if (res.ok) {
        const data = await res.json()
        console.log('获取到的用户数据:', data)
        setUsers(data.users || [])
      } else {
        const errorData = await res.json()
        console.error('API 错误响应:', errorData)
        alert(`加载用户失败: ${errorData.error || res.statusText}`)
      }
    } catch (error) {
      console.error('加载用户异常:', error)
      alert(`加载用户失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleUserUpdate = () => {
    loadUsers()
    setDialogOpen(false)
    setSelectedUser(null)
  }

  const handlePermissionToggle = async (userId: string, permission: 'canPost' | 'canComment' | 'canSendMessage', currentValue: boolean) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/users/${userId}/permissions`
      const newValue = !currentValue

      console.log(`正在修改权限: 用户ID=${userId}, 权限=${permission}, 新值=${newValue}`)

      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          can_post: permission === 'canPost' ? newValue : undefined,
          can_comment: permission === 'canComment' ? newValue : undefined,
          can_send_message: permission === 'canSendMessage' ? newValue : undefined,
        }),
      })

      console.log(`权限修改响应: status=${res.status}, ok=${res.ok}`)

      if (res.ok) {
        const data = await res.json()
        console.log('权限修改成功:', data)
        loadUsers()
      } else {
        const errorData = await res.json()
        console.error('权限修改失败:', errorData)
        alert(`操作失败: ${errorData.error || res.statusText}`)
      }
    } catch (error) {
      console.error('权限修改异常:', error)
      alert(`操作失败: ${error}`)
    }
  }

  const openUserDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "banned":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive">已封号</span>
      case "suspended":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">已禁言</span>
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-500">正常</span>
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
          <Shield className="h-3 w-3" />
          管理员
        </span>
      )
    }
    return <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">用户</span>
  }

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* 搜索栏 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("admin.searchUsers")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 用户列表 */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium">角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                <th className="px-4 py-3 text-center text-sm font-medium">权限</th>
                <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    {searchQuery ? t("admin.noSearchResults") : t("admin.noUsers")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                            user.canPost ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                          }`}
                          title="发帖"
                        >
                          <Edit3 className="h-3 w-3" />
                        </span>
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                            user.canComment ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                          }`}
                          title="评论"
                        >
                          💬
                        </span>
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                            user.canSendMessage ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                          }`}
                          title="私信"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin1 && (
                          <>
                            <button
                              onClick={() => handlePermissionToggle(user.id, 'canPost', user.canPost)}
                              className={`px-2 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                                user.canPost
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                              }`}
                              title={user.canPost ? "禁止发帖" : "允许发帖"}
                            >
                              {user.canPost ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              发帖
                            </button>
                            <button
                              onClick={() => handlePermissionToggle(user.id, 'canSendMessage', user.canSendMessage)}
                              className={`px-2 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                                user.canSendMessage
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                              }`}
                              title={user.canSendMessage ? "禁止私信" : "允许私信"}
                            >
                              {user.canSendMessage ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              私信
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openUserDialog(user)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          管理
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 统计信息 */}
        <div className="text-center text-sm text-muted-foreground">
          {t("admin.totalUsers", { count: filteredUsers.length })}
        </div>
      </div>

      {/* 用户操作弹窗 */}
      {selectedUser && (
        <UserActionsDialog
          user={selectedUser}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false)
            setSelectedUser(null)
          }}
          onUpdate={handleUserUpdate}
        />
      )}
    </>
  )
}
