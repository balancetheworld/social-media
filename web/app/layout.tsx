import type { Metadata, Viewport } from 'next'
import { Noto_Sans_SC, Geist_Mono } from 'next/font/google'
import { SocialProvider } from '@/lib/social-context'
import { SearchProvider } from '@/lib/search-context'
import { LoginPromptProvider } from '@/components/ui/login-prompt'
import './globals.css'

const _notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: '微言 - 社交平台',
  description: '分享你的想法，连接志同道合的人',
}

export const viewport: Viewport = {
  themeColor: '#e05d36',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <SocialProvider>
          <SearchProvider>
            <LoginPromptProvider>
              {children}
            </LoginPromptProvider>
          </SearchProvider>
        </SocialProvider>
      </body>
    </html>
  )
}
