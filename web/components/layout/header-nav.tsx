"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home, Bell, Mail, PenSquare,
  LogIn, LogOut, Menu, X, ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSocial } from "@/lib/social-context"
import { useState, useEffect, useRef } from "react"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "首页", auth: false },
  { href: "/notifications", icon: Bell, label: "通知", auth: true },
  { href: "/messages", icon: Mail, label: "私信", auth: true },
]

export function FloatingNav() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    currentUser, currentUserId, isLoggedIn,
    unreadNotificationCount, unreadMessageCount, logout,
  } = useSocial()

  const [hovered, setHovered] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const mobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min((y / h) * 100, 100) : 0)
      setShowTop(y > 400)
    }
    fn()
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [mobileOpen])

  const visibleNav = NAV_ITEMS.filter(i => !i.auth || isLoggedIn)
  const expanded = hovered

  const handleLogout = () => setConfirmLogout(true)
  const doLogout = async () => {
    setConfirmLogout(false)
    await logout()
    router.push("/")
  }

  const circR = 14
  const circC = 2 * Math.PI * circR
  const circO = circC - (progress / 100) * circC

  return (
    <>
      {/* Minimal progress line */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-border/30">
        <div className="h-full bg-primary/70 transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>

      {/* ===== Desktop floating nav ===== */}
      <nav
        className="fixed left-4 top-4 z-50 hidden md:block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center rounded-2xl glass-static shadow-lg transition-all duration-300">
          {/* Brand pill */}
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 hover:bg-primary/5 transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-primary-foreground tracking-tight">
              W
            </div>
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              {"wei"}
              <span className="text-primary">{"yan"}</span>
            </span>
          </Link>

          {/* Expandable section */}
          <div
            className={cn(
              "flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              expanded ? "max-w-[600px] opacity-100" : "max-w-0 opacity-0"
            )}
          >
            <div className="h-5 w-px bg-border/40 shrink-0 mx-0.5" />

            {visibleNav.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              const badge = item.href === "/notifications" ? unreadNotificationCount : item.href === "/messages" ? unreadMessageCount : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[13px] transition-colors mx-0.5",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-3.5 w-3.5" />
                    {badge > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </div>
                  {item.label}
                </Link>
              )
            })}

            <div className="h-5 w-px bg-border/40 shrink-0 mx-0.5" />

            {/* User section */}
            {isLoggedIn && currentUser ? (
              <>
                <Link
                  href={`/profile/${currentUserId}`}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors mx-0.5"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="text-[8px]">{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[56px] truncate text-[13px]">{currentUser.name}</span>
                </Link>

                {/* Visible logout button */}
                <button
                  onClick={handleLogout}
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-2 py-1.5 text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mx-0.5"
                  title="退出登录"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>

                <div className="h-5 w-px bg-border/40 shrink-0 mx-0.5" />

                <Link href="/?compose=true" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors mx-1 mr-2">
                  <PenSquare className="h-3.5 w-3.5" /> 发布
                </Link>
              </>
            ) : (
              <Link href="/login" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors mx-1 mr-2">
                <LogIn className="h-3.5 w-3.5" /> 登录
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Mobile bottom capsule ===== */}
      <div ref={mobileRef} className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden">
        {mobileOpen && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 glass-static rounded-2xl p-2 shadow-xl animate-slide-up">
            <nav className="flex flex-col gap-0.5">
              {visibleNav.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted/40")}>
                    <Icon className="h-4 w-4" /> {item.label}
                  </Link>
                )
              })}
            </nav>

            {isLoggedIn && currentUser && (
              <>
                <div className="my-1 h-px bg-border/30" />
                <Link href={`/profile/${currentUserId}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted/40">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="text-[8px]">{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  {currentUser.name}
                </Link>
              </>
            )}

            <div className="my-1 h-px bg-border/30" />

            {isLoggedIn ? (
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> 退出登录
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/10">
                <LogIn className="h-4 w-4" /> 登录 / 注册
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-0.5 rounded-2xl glass-static px-1 py-1 shadow-lg">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex items-center gap-1.5 rounded-xl px-3 py-2" aria-label="导航菜单">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="text-xs font-bold text-foreground">wei<span className="text-primary">yan</span></span>
          </button>
          <div className="h-5 w-px bg-border/30" />
          {visibleNav.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const badge = item.href === "/notifications" ? unreadNotificationCount : item.href === "/messages" ? unreadMessageCount : 0
            return (
              <Link key={item.href} href={item.href} className={cn("relative rounded-xl p-2.5 transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                <Icon className="h-4 w-4" />
                {badge > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Logout confirmation */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={() => setConfirmLogout(false)}>
          <div className="glass-static w-80 rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground">确认登出</h3>
            <p className="mt-2 text-sm text-muted-foreground">确定要退出当前账号吗？</p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={doLogout}
                className="flex-1 rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                确认登出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed right-4 bottom-4 z-50 h-9 w-9 rounded-xl transition-all duration-300",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="回到顶部"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={circR} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border/50" />
          <circle cx="18" cy="18" r={circR} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeDasharray={circC} strokeDashoffset={circO} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center glass-static rounded-xl shadow-md">
          <ChevronUp className="h-3.5 w-3.5 text-foreground" />
        </span>
      </button>
    </>
  )
}
