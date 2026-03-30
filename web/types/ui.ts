export type Locale = (typeof locales)[number]

declare const locales: readonly ["zh", "en", "ja"]

export interface ChartConfig {
  [key: string]: {
    label?: string
    icon?: React.ComponentType
    color?: string
  }
}

export interface ChartContextProps {
  config: ChartConfig
}

export interface CarouselApi {
  scrollTo: (index: number) => void
  scrollNext: () => void
  scrollPrev: () => void
  canScrollNext: boolean
  canScrollPrev: boolean
}

export type CarouselOptions = {
  loop?: boolean
  align?: "start" | "center" | "end"
  skipSnaps?: boolean
}

export interface CarouselProps {
  children: React.ReactNode
  className?: string
  orientation?: "horizontal" | "vertical"
  opts?: CarouselOptions
  setApi?: (api: CarouselApi) => void
}

export interface CarouselContextProps {
  api: CarouselApi | null
  canScrollNext: boolean
  canScrollPrev: boolean
  scrollNext: () => void
  scrollPrev: () => void
}

export interface SidebarContextProps {
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
  state: "expanded" | "collapsed"
}

export interface PaginationLinkProps extends React.ComponentProps<"a"> {
  isActive?: boolean
}

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export type ToastActionElement = React.ReactElement<typeof ToastAction>

declare const ToastAction: React.FC
