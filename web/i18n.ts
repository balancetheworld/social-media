import { getRequestConfig } from 'next-intl/server'

export const locales = ['zh', 'en', 'ja'] as const
export const defaultLocale = 'zh' as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
