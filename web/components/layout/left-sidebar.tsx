"use client" 
/**
 * 核心声明：标记这是 Next.js 客户端组件
 * 关键作用：
 * 1. 允许使用 React Hooks（useState/useEffect 等）
 * 2. 允许访问浏览器 API（window/document）
 * 3. 该组件会在客户端渲染，而非服务端（支持交互逻辑）
 */

// ====================== 依赖导入区 ======================
// Next.js 核心导航组件：用于客户端无刷新路由跳转
import Link from "next/link"

// Next.js 导航钩子（App Router 特有）：
// - usePathname：获取当前 URL 的路径部分（如 "/profile/123"）
// - useRouter：获取路由实例，用于编程式导航（如登出后跳转首页）
import { usePathname, useRouter } from "next/navigation"

// Lucide React 图标库：导入所需的线性图标组件（新增 Settings 设置图标）
import { Home, Bell, Mail, LogOut, PenSquare, User, Settings } from "lucide-react"

// 自定义工具函数：cn = clsx + tailwind-merge 组合
// 作用：安全拼接 Tailwind CSS 类名，解决类名冲突和条件判断问题
import { cn } from "@/lib/utils"

// shadcn/ui 组件：头像组件（支持图片显示/降级显示首字母）
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// 自定义上下文 Hook：封装社交应用的全局状态
// 作用：统一管理用户信息、登录状态、消息计数、登出方法等，解耦组件与全局状态
import { useSocial } from "@/lib/social-context"

// 国际化 Hook：next-intl 库提供，用于多语言翻译
import { useTranslations } from "next-intl"

// 自定义组件：主题切换（亮色/暗色模式）
import { ThemeToggle } from "@/components/ui/theme-toggle"
// 自定义组件：语言切换（多语言支持）
import { LanguageSwitcher } from "@/components/language-switcher"

// React 核心 Hook：用于管理组件内部状态（登出确认弹窗的显示/隐藏）
import { useState } from "react"

// shadcn/ui 下拉菜单组件：用于封装设置菜单（主题/语言切换）
import {
  DropdownMenu,        // 下拉菜单容器
  DropdownMenuContent, // 下拉菜单内容区域
  DropdownMenuItem,    // 下拉菜单项
  DropdownMenuTrigger, // 下拉菜单触发按钮
} from "@/components/ui/dropdown-menu"

// ====================== 自定义 Hook：导航项配置 ======================
/**
 * useNavItems - 封装导航菜单配置的自定义 Hook
 * 设计思路：
 * 1. 将导航项数据与渲染逻辑分离，便于维护和扩展
 * 2. 结合国际化翻译，动态生成多语言的导航标签
 * 3. 通过 auth 属性控制导航项的权限（是否需要登录才能显示）
 * @returns {Array<Object>} 导航项数组，每个项包含：
 * - href: 跳转路径
 * - icon: 图标组件
 * - label: 翻译后的导航标签
 * - auth: 是否需要登录才能显示
 */
function useNavItems() {
  // 获取 "nav" 命名空间的翻译函数（对应翻译文件中的 nav 节点）
  const t = useTranslations("nav")
  
  return [
    // 首页：无需登录即可访问
    { href: "/", icon: Home, label: t("home"), auth: false },
    // 通知页：仅登录用户可见
    { href: "/notifications", icon: Bell, label: t("notifications"), auth: true },
    // 消息页：仅登录用户可见
    { href: "/messages", icon: Mail, label: t("messages"), auth: true },
  ]
}

// ====================== 主组件：LeftSidebar ======================
/**
 * LeftSidebar - 左侧侧边栏主组件
 * 核心结构（从上到下）：
 * 1. Logo 区域 → 2. 大尺寸用户头像卡片 → 3. 导航菜单 → 4. 设置下拉菜单 → 5. 发布按钮 → 6. 登出按钮（左下角）
 * 核心特性：
 * - 响应式：仅桌面端（md 及以上）显示
 * - 状态驱动：根据登录状态展示不同内容
 * - 交互反馈：导航项激活状态、未读消息徽章、hover 效果
 * - 独立设置菜单：主题/语言切换封装在设置下拉菜单中
 * - 独立登出按钮：固定在左下角，操作更直观
 */
export function LeftSidebar() {
  // ====================== 状态/钩子初始化 ======================
  // 获取当前 URL 路径（用于判断导航项的激活状态）
  // 示例：访问 "/notifications/123" → pathname = "/notifications/123"
  const pathname = usePathname()
  
  // 获取路由实例，用于编程式导航（如登出后跳转到首页）
  const router = useRouter()
  
  // 获取全局翻译函数（无命名空间，可翻译通用文本）
  const t = useTranslations()
  
  // 从社交上下文 Hook 解构核心状态和方法
  const {
    currentUser,               // 当前登录用户信息（对象）：{ name, avatar, handle, ... }
    currentUserId,             // 当前用户 ID（字符串/数字）
    isLoggedIn,                // 是否登录（布尔值）
    unreadNotificationCount,   // 未读通知数量（数字）
    unreadMessageCount,        // 未读消息数量（数字）
    logout,                    // 登出方法（异步函数：清理 token/登录状态）
    openComposeDialog,         // 打开发布内容弹窗的方法
  } = useSocial()

  // 登出确认状态：控制登出确认弹窗的显示/隐藏（默认隐藏）
  const [confirmLogout, setConfirmLogout] = useState(false)
  
  // 获取导航项配置数组
  const NAV_ITEMS = useNavItems()

  // 过滤导航项：仅显示「无需登录」或「已登录用户」可访问的项
  // 逻辑：!i.auth（无需登录） || isLoggedIn（已登录）
  const visibleNav = NAV_ITEMS.filter(i => !i.auth || isLoggedIn)

  // ====================== 登出相关方法 ======================
  /**
   * handleLogout - 触发登出确认弹窗
   * 设计思路：不直接执行登出，先显示确认弹窗，防止用户误操作
   */
  const handleLogout = () => setConfirmLogout(true)
  
  /**
   * doLogout - 执行实际登出操作
   * 执行流程：
   * 1. 关闭登出确认弹窗 → 2. 调用上下文的 logout 方法（清理登录状态）→ 3. 跳转到首页
   * 注意：logout 是异步方法，需用 await 等待执行完成
   */
  const doLogout = async () => {
    setConfirmLogout(false) // 关闭确认弹窗
    await logout()          // 执行登出逻辑（清理 token/用户状态）
    router.push("/")        // 登出后跳转到首页
  }

  // ====================== 组件渲染 ======================
  return (
    <>
      {/* ========== 桌面端侧边栏（移动端隐藏） ========== */}
      {/* 样式核心说明：
        - hidden md:flex：md 屏幕以下隐藏，md 及以上显示
        - md:flex-col：md 及以上屏幕垂直排列
        - w-[250px]：固定宽度 250px（比之前的 275px 更窄）
        - h-screen：高度占满整个屏幕
        - sticky top-0：固定在视口顶部，滚动页面时不消失
        - shrink-0：不被挤压，保持宽度不变
      */}
      <aside className="hidden md:flex md:flex-col w-[250px] h-screen sticky top-0 shrink-0">
        {/* 侧边栏容器：
          - flex-col：垂直排列子元素
          - h-full：高度占满父容器（aside）
          - px-2 py-3：内边距，控制内容与侧边栏边缘的距离
        */}
        <div className="flex flex-col h-full px-2 py-3">
          {/* 1. Logo 区域 */}
          <Link
            href="/"
            className="mx-3 mb-2 w-fit rounded-full p-3 transition-colors"
          >
            {/* SVG Logo 图标：
              - viewBox="0 0 24 24"：保持 SVG 原始比例
              - h-7 w-7：固定尺寸
              - fill-primary：使用主题主色填充
              - aria-hidden="true"：无障碍优化，屏幕阅读器忽略该图标
            */}
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-primary" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </Link>

          {/* 2. 用户头像卡片（不可点击展开，仅展示/跳转） */}
          <div className=" mb-4 flex items-center">
            {/* 已登录状态：显示大尺寸用户头像卡片，点击跳个人资料页 */}
            {isLoggedIn && currentUser ? (
              <Link
                href={`/profile/${currentUserId}`} // 跳转到当前用户的个人资料页
                // 样式说明：
                // - flex-col：垂直排列头像和文字
                // - items-center：水平居中
                // - gap-6：头像和文字间距 1.5rem
                // - rounded-2xl：大圆角，视觉更友好
                // - p-6：大内边距，突出用户卡片
                // - transition-colors：hover 过渡效果
                className="flex flex-col ml-10 items-center gap-6 rounded-2xl p-6 transition-colors"
              >
                {/* 超大尺寸头像：h-28 w-28（7rem），突出用户信息 */}
                <Avatar className="h-28 w-28">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} /> {/* 优先显示用户头像 */}
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback> {/* 降级显示用户名首字母 */}
                </Avatar>
                
                {/* 用户信息区域：居中显示，支持文本截断 */}
                <div className="flex flex-col items-center min-w-0">
                  <span className="text-xl font-bold truncate w-full text-center">{currentUser.name}</span> {/* 用户名：大号加粗 */}
                  <span className="text-md text-muted-foreground truncate">@{currentUser.handle}</span> {/* 用户名 handle：灰色中等字号 */}
                </div>
              </Link>
            ) : (
              // 未登录状态：显示登录引导卡片，点击跳登录页
              <Link
                href="/login"
                // 样式说明：
                // - flex-col：垂直排列
                // - items-center：居中
                // - gap-2：间距更小
                // - p-3：内边距更小
                className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors"
              >
                {/* 灰色占位头像：h-16 w-16（4rem），比登录状态小 */}
                <Avatar className="h-16 w-16 bg-muted">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-8 w-8" /> {/* 显示 User 图标，提示未登录 */}
                  </AvatarFallback>
                </Avatar>
                
                {/* 登录引导文字：更小字号 */}
                <div className="flex flex-col items-center min-w-0">
                  <span className="text-sm font-bold truncate">{t("nav.notLoggedIn")}</span> {/* 未登录提示 */}
                  <span className="text-xs text-muted-foreground truncate">{t("nav.clickToLogin")}</span> {/* 点击登录提示 */}
                </div>
              </Link>
            )}
          </div>

          {/* 3. 导航菜单区域 */}
          <nav className="flex flex-col gap-1 ml-5"> {/* ml-15：导航项右移，视觉更对齐 */}
            {/* 遍历过滤后的导航项，生成导航链接 */}
            {visibleNav.map((item) => {
              // 判断导航项是否为激活状态：
              // - 首页（/）：严格匹配 pathname === "/"
              // - 其他项（如 /notifications）：pathname 以该项 href 开头（支持子路径激活）
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              
              // 动态获取图标组件（Home/Bell/Mail）
              const Icon = item.icon
              
              // 获取未读数量：
              // - 通知页：unreadNotificationCount
              // - 消息页：unreadMessageCount
              // - 其他项：0（不显示徽章）
              const badge = item.href === "/notifications" ? unreadNotificationCount : item.href === "/messages" ? unreadMessageCount : 0
              
              return (
                <Link
                  key={item.href} // 唯一 key：使用导航路径，保证 React 列表渲染性能
                  href={item.href} // 跳转路径
                  // 动态类名：
                  // - 基础样式：flex 布局、内边距、过渡效果
                  // - 激活状态：加粗 + 黑色
                  // - 未激活：灰色
                  className={cn(
                    "flex items-center gap-5 rounded-full px-4 py-3 text-xl transition-colors group",
                    isActive
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    {/* 导航图标：
                      - 激活状态描边更粗（2.5），突出显示
                      - 未激活描边 2，常规样式
                    */}
                    <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                    
                    {/* 未读徽章：仅当 badge > 0 时显示 */}
                    {badge > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                        {/* 脉冲动画层：实现呼吸效果，吸引用户注意 */}
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75" />
                        {/* 实心圆点层：基础徽章样式 */}
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                      </span>
                    )}
                  </div>
                  {/* 导航标签：
                    - max-w-[150px]：限制最大宽度
                    - truncate：超长文本截断（显示...）
                  */}
                  <span className="max-w-[150px] truncate">{item.label}</span>
                </Link>
              )
            })}

            {/* 个人资料导航项（仅登录后显示） */}
            {isLoggedIn && currentUserId && (
              <Link
                href={`/profile/${currentUserId}`} // 跳转到当前用户的个人资料页
                // 激活状态判断：
                // - 路径以 "/profile/" 开头
                // - 路径层级为 3（如 "/profile/123" → split("/") = ["", "profile", "123"]）
                className={cn(
                  "flex items-center gap-5 rounded-full px-4 py-3 text-xl transition-colors group",
                  pathname.startsWith("/profile/") && pathname.split("/").length === 3
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <User className="h-6 w-6" strokeWidth={pathname.startsWith("/profile/") && pathname.split("/").length === 3 ? 2.5 : 2} />
                <span className="max-w-[150px] truncate">{t("nav.profile")}</span>
              </Link>
            )}

            {/* 4. 设置下拉菜单（和个人资料并列） */}
            <DropdownMenu>
              {/* 下拉菜单触发按钮 */}
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-5 rounded-full px-4 py-3 text-xl text-muted-foreground transition-colors group text-left"
                >
                  <Settings className="h-6 w-6" /> {/* 设置图标 */}
                  <span className="max-w-[150px] truncate">{t("nav.settings")}</span> {/* 设置标签（多语言） */}
                </button>
              </DropdownMenuTrigger>
              
              {/* 下拉菜单内容：
                - align="start"：与触发按钮左对齐
                - w-56：固定宽度，保证菜单美观
              */}
              <DropdownMenuContent align="start" className="w-56">
                {/* 主题切换项：显示带标签的主题切换组件 */}
                <DropdownMenuItem asChild>
                  <div className="cursor-pointer">
                    <ThemeToggle showLabel />
                  </div>
                </DropdownMenuItem>
                
                {/* 语言切换项：显示带标签的语言切换组件 */}
                <DropdownMenuItem asChild>
                  <div className="cursor-pointer">
                    <LanguageSwitcher showLabel />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 5. 发布按钮（仅登录后显示） */}
            {isLoggedIn && (
              <button
                onClick={openComposeDialog} // 点击打开发布内容弹窗
                // 样式：黑色背景、圆角、hover 深色过渡、居中对齐
                className="mt-2 mx-3 flex items-center justify-center gap-2 rounded-full bg-black px-4 py-3.5 text-base font-bold text-white hover:bg-black/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 transition-colors"
              >
                <PenSquare className="h-5 w-5" /> {/* 发布图标 */}
                {t("nav.post")}                   {/* 发布标签（多语言） */}
              </button>
            )}
          </nav>

          {/* 6. 登出按钮（左下角，仅登录后显示） */}
          {isLoggedIn && (
            <button
              onClick={handleLogout} // 点击触发登出确认弹窗
              // 样式说明：
              // - mt-auto：自动推到容器底部
              // - hover:text-destructive：hover 时红色文字
              // - hover:bg-destructive/10：hover 时浅红色背景
              className="mt-auto mx-3 mb-3  flex items-center gap-3 rounded-full px-4 py-3 text-muted-foreground hover:font-bold  text-left"
            >
              <LogOut className="h-5 w-5" /> {/* 登出图标 */}
              <span className="text-sm">{t("nav.logout")}</span> {/* 登出标签（多语言） */}
            </button>
          )}
        </div>
      </aside>

      {/* ========== 登出确认弹窗（条件渲染） ========== */}
      {/* 仅当 confirmLogout 为 true 时显示 */}
      {confirmLogout && (
        <div 
          // 遮罩层样式：
          // - fixed inset-0：覆盖整个视口
          // - z-[70]：保证弹窗在最上层
          // - bg-background/60：半透明背景
          // - backdrop-blur-sm：毛玻璃效果
          // - flex items-center justify-center：弹窗居中
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/60 backdrop-blur-sm" 
          onClick={() => setConfirmLogout(false)} // 点击遮罩层关闭弹窗
        >
          {/* 弹窗内容：
            - onClick={(e) => e.stopPropagation()}：阻止事件冒泡（避免点击弹窗内部关闭）
            - glass-card：自定义毛玻璃卡片样式
            - w-80：固定宽度
            - rounded-2xl：大圆角
            - shadow-xl：阴影提升层次感
            - p-6：内边距
          */}
          <div className="glass-card w-80 rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">{t("nav.confirmLogout")}</h3> {/* 确认登出标题 */}
            <p className="mt-2 text-sm text-muted-foreground">{t("nav.logoutConfirmMessage")}</p> {/* 确认提示文字 */}
            
            {/* 按钮区域：取消 + 确认登出 */}
            <div className="mt-5 flex gap-2.5">
              {/* 取消按钮：边框样式，hover 浅灰色背景 */}
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              
              {/* 确认登出按钮：红色背景（危险操作），hover 深色过渡 */}
              <button
                onClick={doLogout}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground  "
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}