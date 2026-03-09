"use client"

import { Moon, Sun, Monitor, Trees } from "lucide-react"
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

  const currentTheme = theme === "system" ? "system" : (theme || "light")

  const handleThemeChange = (newTheme: "light" | "dark" | "system" | "forest") => {
    setTheme(newTheme)
    setShowPopup(false)
    // 刷新页面以确保主题完全应用
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  // 定义所有主题及其图标
  const themes: Array<"light" | "dark" | "forest"> = ["light", "dark", "forest"]
  const allOptions = [...themes, "system"] as const

  // 获取当前主题在列表中的索引
  const currentIndex = currentTheme === "system" ? 3 : themes.indexOf(currentTheme as "light" | "dark" | "forest")

  // 滑动开关模式（用于导航栏）
  if (!showLabel) {
    // 计算滑块位置：4 个主题平分宽度
    const getSliderPosition = () => {
      const step = 100 / 4
      return step * currentIndex + step / 2
    }

    return (
      <div className="relative">
        <button
          onClick={() => {
            const nextIndex = (currentIndex + 1) % 4
            handleThemeChange(allOptions[nextIndex] as any)
          }}
          className="relative h-7 w-14 rounded-full bg-muted transition-all duration-300 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring/50"
          aria-label={`${t("theme")}: ${currentTheme === "light" ? t("light") : currentTheme === "dark" ? t("dark") : currentTheme === "forest" ? "森林" : t("system")}`}
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          <div
            className="absolute top-1 h-5 w-5 rounded-full bg-primary shadow-md transition-all duration-300 ease-out"
            style={{ left: `calc(${getSliderPosition()}% - 10px)` }}
          >
            <div className="flex h-full w-full items-center justify-center text-primary-foreground">
              {currentTheme === "light" && <Sun className="h-3 w-3" />}
              {currentTheme === "dark" && <Moon className="h-3 w-3" />}
              {currentTheme === "forest" && <Trees className="h-3 w-3" />}
              {currentTheme === "system" && <Monitor className="h-3 w-3" />}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-30">
            <Sun className="h-2.5 w-2.5" />
            <Moon className="h-2.5 w-2.5" />
            <Trees className="h-2.5 w-2.5" />
            <Monitor className="h-2.5 w-2.5" />
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
                onClick={() => handleThemeChange("forest")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  currentTheme === "forest" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
                }`}
              >
                <Trees className="h-3.5 w-3.5" />
                <span>森林</span>
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
            setTheme("forest")
            setTimeout(() => {
              window.location.reload()
            }, 100)
          }}
          className={currentTheme === "forest" ? "bg-accent" : ""}
        >
          <Trees className="mr-2 h-4 w-4" />
          森林
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
