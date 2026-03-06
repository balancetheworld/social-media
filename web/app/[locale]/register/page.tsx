"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { useTranslations } from "next-intl"

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations("auth")
  const { register } = useSocial()
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(username, password, displayName)
      router.push("/")
    } catch (err: any) {
      setError(err.message || t("registerFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">W</div>

        <div className="w-full glass-card p-6">
          <h1 className="text-2xl font-bold text-card-foreground text-center">{t("createAccount")}</h1>
          <p className="mt-1.5 text-center text-sm text-muted-foreground">{t("registerSubtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="displayName" className="text-sm font-medium text-card-foreground">{t("displayName")}</label>
              <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("displayNamePlaceholder")} required className="glass-input h-11 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-card-foreground">{t("username")}</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("usernameDesc")} required className="glass-input h-11 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-card-foreground">{t("password")}</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordMin")} required minLength={6} className="glass-input h-11 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all" />
            </div>

            <Button type="submit" disabled={loading} className="h-11 rounded-xl text-sm font-medium">
              {loading ? t("signingUp") : t("signUp")}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">{t("loginNow")}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
