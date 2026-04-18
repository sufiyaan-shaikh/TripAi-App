"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getStoredUser, isLoggedIn, clearTokens } from "@/lib/auth"

export function useAuth() {
  const router = useRouter()
  // Immediately populate from localStorage — no loading flash
  const [user, setUser]       = useState(() => {
    if (typeof window === "undefined") return null
    return getStoredUser()
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true
    return !getStoredUser()
  })

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login")
      return
    }

    // User is cached — show immediately, then silently re-validate in background
    const silentRevalidate = async () => {
      try {
        const freshUser = await getCurrentUser()
        if (!freshUser) {
          clearTokens()
          router.push("/auth/login")
          return
        }
        setUser(freshUser)
      } catch {
        // Token expired — kick to login
        clearTokens()
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    silentRevalidate()
  }, [router])

  return { user, loading }
}