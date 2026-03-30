"use client"

import { useState, createContext, useContext, useCallback } from "react"
import Link from "next/link"
import { LogIn, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

import type { LoginPromptContextType } from "@/types/context"

// LoginPromptContextType is now imported from @/types/context

const LoginPromptContext = createContext<LoginPromptContextType>({ showPrompt: () => {} })

export function useLoginPrompt() {
  return useContext(LoginPromptContext)
}

export function LoginPromptProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("loginPrompt")
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  const showPrompt = useCallback((msg?: string) => {
    setMessage(msg || t("title"))
    setOpen(true)
  }, [t])

  return (
    <LoginPromptContext.Provider value={{ showPrompt }}>
      {children}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[300px] glass-card p-5 shadow-2xl animate-scale-in">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-2.5 top-2.5 rounded-lg p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              aria-label="关闭"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex flex-col items-center gap-3.5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <LogIn className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-card-foreground">{message}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("description")}</p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button asChild className="w-full rounded-lg h-9 text-sm">
                  <Link href="/login" onClick={() => setOpen(false)}>{t("signIn")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-lg h-9 text-sm">
                  <Link href="/register" onClick={() => setOpen(false)}>{t("signUp")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoginPromptContext.Provider>
  )
}
