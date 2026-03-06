"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/lib/social-context"
import { useTranslations } from "next-intl"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations("auth")
  const { login } = useSocial()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      router.push("/")
    } catch (err: any) {
      setError(err.message || t("loginFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[380px] flex flex-col items-center gap-5 animate-fade-in">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground">
            W
          </div>
          <span className="text-xl font-bold text-foreground">
            {"wei"}
            <span className="text-primary">{"yan"}</span>
          </span>
        </Link>

        <div className="w-full glass-card p-6">
          <h1 className="text-xl font-bold text-card-foreground text-center">{t("welcomeBack")}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t("loginSubtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-medium text-card-foreground">{t("username")}</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("usernamePlaceholder")}
                required
                className="glass-input h-10 px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-card-foreground">{t("password")}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                required
                className="glass-input h-10 px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="h-10 rounded-lg text-sm font-medium mt-1">
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">{t("registerNow")}</Link>
          </p>
        </div>

        <div className="w-full glass-card p-3.5">
          <p className="text-[11px] text-muted-foreground text-center mb-2">{t("demoAccount")}</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["xiaoming", "siyu_chen", "haoran_z"].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => { setUsername(name); setPassword("123456") }}
                className="rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-card-foreground border border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
