"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { Session, SupabaseClient, User as SupabaseUser } from "@supabase/auth-helpers-nextjs"

export interface User extends SupabaseUser {
  nombre?: string
  credits?: number
}

type AuthContextType = {
  user: User | null
  setUserCredits: (credits: number) => void
  isLoading: boolean
  supabase: SupabaseClient
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children, session: serverSession }: { children: React.ReactNode; session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(serverSession?.user ?? null)
  const [isLoading, setIsLoading] = useState(true)

  const setUserCredits = (credits: number) => {
    setUser((currentUser) => {
      if (!currentUser) return null
      return { ...currentUser, credits }
    })
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        router.refresh()
      } else if (session) {
        setUser(session.user)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    supabase
      .from("profiles")
      .select("nombre, credits")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setUser((currentUser) => {
            if (!currentUser) return null
            return { ...currentUser, ...data }
          })
        }
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user profile:", error)
        }
        setIsLoading(false)
      })
  }, [user?.id, supabase])

  const value = {
    user,
    setUserCredits,
    isLoading,
    supabase,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.")
  }
  return context
}
