// "use client" 指令：声明这是一个客户端组件（Client Component）
// Next.js 13+ 的 App Router 中，组件默认是服务端组件（Server Component），
// 而 useRouter、useLocale 等客户端钩子只能在客户端组件中使用，因此必须声明
"use client"

// 导入 Next.js 导航相关的核心钩子
// useRouter：用于编程式导航（跳转页面）
// usePathname：获取当前页面的路径（如 /zh/about 或 /en/home）
import { useRouter, usePathname } from "@/i18n/routing"
// useLocale：next-intl 库提供的钩子，用于获取当前激活的语言环境（如 zh/en/ja）
import { useLocale } from "next-intl"
// 导入项目中封装的 UI 组件：按钮
import { Button } from "@/components/ui/button"
// 导入下拉菜单相关的组件（Radix UI 封装）
import {
  DropdownMenu,        // 下拉菜单容器，管理菜单的打开/关闭状态
  DropdownMenuContent, // 下拉菜单的内容区域（选项列表）
  DropdownMenuItem,    // 下拉菜单的单个选项
  DropdownMenuTrigger, // 触发下拉菜单的元素（点击后展开菜单）
} from "@/components/ui/dropdown-menu"
// 导入 Globe（地球）图标组件（lucide-react 图标库）
import { Globe } from "lucide-react"

// 定义支持的语言列表常量（as const 使其成为只读的常量类型，增强类型安全）
// code：语言标识（与 next-intl 配置的 locale 对应）
// name：语言显示名称（给用户看的）
const LANGUAGES = [
  { code: "zh", name: "简体中文", flag: "🇨🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" }
] as const

interface LanguageSwitcherProps {
  showLabel?: boolean
}

// 导出语言切换器组件（函数式组件）
export function LanguageSwitcher({ showLabel = false }: LanguageSwitcherProps) {
  // 获取当前激活的语言环境（如 "zh"）
  const locale = useLocale()
  // 获取路由实例，用于跳转页面
  const router = useRouter()
  // 获取当前页面的路径名（如 "/zh/blog" 或 "/about"）
  const pathname = usePathname()

  // 从语言列表中找到当前激活的语言对象（用于显示当前语言名称）
  const currentLanguage = LANGUAGES.find(lang => lang.code === locale)

  // 核心函数：处理语言切换逻辑
  // 使用 next-intl 内置的导航功能，自动处理路径前缀
  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale })
  }

  // 下拉菜单模式（用于左侧边栏用户菜单）
  if (showLabel) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-left">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">语言</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={locale === lang.code ? "bg-accent" : ""}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // 组件渲染部分（按钮模式，用于导航栏）
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* asChild：将 Button 作为触发器的子元素，保留 Button 的样式和行为 */}
        <Button variant="ghost" size="sm" className="gap-2">
          {/* 地球图标：视觉标识，尺寸 4x4 */}
          <Globe className="h-4 w-4" />
          {/* 显示当前语言名称：移动端隐藏（sm:inline），PC端显示 */}
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <span className="sm:hidden">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      {/* 下拉菜单内容：align="end" 让菜单右对齐（美观） */}
      <DropdownMenuContent align="end">
        {/* 遍历所有支持的语言，生成下拉选项 */}
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code} // 唯一key，React列表必需
            // 点击选项时触发语言切换
            onClick={() => switchLanguage(lang.code)}
            // 样式：当前选中的语言添加背景色（bg-accent），突出显示
            className={locale === lang.code ? "bg-accent" : ""}
          >
            {/* 显示国旗和语言名称 */}
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
