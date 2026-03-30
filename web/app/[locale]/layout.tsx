import type { Metadata, Viewport } from 'next'
import { Noto_Sans_SC, Noto_Sans_JP, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SocialProvider } from '@/lib/social-context'
import { SearchProvider } from '@/lib/search-context'
import { LoginPromptProvider } from '@/components/ui/login-prompt'
import { ThemeProvider } from '@/components/theme-provider'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import '../globals.css'

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-noto-sans-sc'
})

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-noto-sans-jp'
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: '微言 - 社交平台',
  description: '分享你的想法，连接志同道合的人',
  icons: {
    icon: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: 'rgb(121, 173, 195)',
  width: 'device-width',
  initialScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  const lang = locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja' : 'en'

  return (
    <html lang={lang} className={`${notoSansSC.variable} ${notoSansJP.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "forest"]}
        >
          <NextIntlClientProvider messages={messages}>
            <SocialProvider>
              <SearchProvider>
                <LoginPromptProvider>
                  {children}
                </LoginPromptProvider>
              </SearchProvider>
            </SocialProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
