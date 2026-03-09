"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ThemeToggleProps {
  showLabel?: boolean
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("common")
  const [mounted, setMounted] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="relative h-7 w-12 rounded-full bg-muted transition-colors"
          aria-label={t("theme")}
        >
          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-muted-foreground/20" />
        </button>
      </div>
    )
  }

  const currentTheme = theme === "system" ? "system" : theme

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    setShowPopup(false)
    // 刷新页面以确保主题完全应用
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  // 滑动开关模式（用于导航栏）
  if (!showLabel) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            if (currentTheme === "light") {
              setTheme("dark")
            } else if (currentTheme === "dark") {
              setTheme("system")
            } else {
              setTheme("light")
            }
            setTimeout(() => {
              window.location.reload()
            }, 100)
          }}
          className="relative h-7 w-12 rounded-full bg-muted transition-all duration-300 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring/50"
          aria-label={`${t("theme")}: ${currentTheme === "light" ? t("light") : currentTheme === "dark" ? t("dark") : t("system")}`}
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-primary shadow-md transition-all duration-300 ease-out ${
              currentTheme === "light" ? "left-1" : currentTheme === "dark" ? "left-[calc(100%-1.25rem)]" : "left-1/2 -translate-x-1/2"
            }`}
          >
            <div className="flex h-full w-full items-center justify-center text-primary-foreground">
              {currentTheme === "light" && <Sun className="h-3 w-3" />}
              {currentTheme === "dark" && <Moon className="h-3 w-3" />}
              {currentTheme === "system" && <Monitor className="h-3 w-3" />}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-1.5 opacity-30">
            <Sun className="h-3 w-3" />
            <Moon className="h-3 w-3" />
          </div>
        </button>

        {showPopup && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 glass-static rounded-xl p-1.5 shadow-xl animate-fade-in min-w-[120px]">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  currentTheme === "light" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>{t("light")}</span>
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  currentTheme === "dark" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>{t("dark")}</span>
              </button>
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  currentTheme === "system" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>{t("system")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 下拉菜单模式（用于左侧边栏用户菜单）
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-left">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">主题</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuItem
          onClick={() => {
            setTheme("light")
            setTimeout(() => {
              window.location.reload()
            }, 100)
          }}
          className={currentTheme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark")
            setTimeout(() => {
              window.location.reload()
            }, 100)
          }}
          className={currentTheme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("system")
            setTimeout(() => {
              window.location.reload()
            }, 100)
          }}
          className={currentTheme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
