"use client"

import { useState, useEffect } from "react"
import { Search, Shield, Ban, MessageSquare, Edit3 } from "lucide-react"
import { useTranslations } from "next-intl"
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
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to load users:", error)
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
                      <button
                        onClick={() => openUserDialog(user)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        管理
                      </button>
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
