"use client"

import { useState } from "react"
import { useSocial } from "@/lib/social-context"
import { useTranslations } from "next-intl"
import { Shield, FileText, Users, Home } from "lucide-react"
import { AdminPostsList } from "@/components/admin/AdminPostsList"
import { AdminUsersList } from "@/components/admin/AdminUsersList"
import { useRouter } from "next/navigation"

type AdminTab = "posts" | "users"

export default function AdminPage() {
  const t = useTranslations()
  const { currentUser, isLoggedIn } = useSocial()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>("posts")

  // 检查管理员权限
  if (!isLoggedIn || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{t("admin.accessDenied")}</h1>
          <p className="mt-2 text-muted-foreground">{t("admin.adminOnly")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部标题栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{t("admin.marbleBoard")}</h1>
                <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              title="返回首页"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">退出</span>
            </button>
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === "posts"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-5 w-5" />
              {t("admin.postsManagement")}
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === "users"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              {t("admin.usersManagement")}
              {activeTab === "users" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "posts" && <AdminPostsList />}
        {activeTab === "users" && <AdminUsersList />}
      </div>
    </div>
  )
}
