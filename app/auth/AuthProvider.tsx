"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"
import type { User } from "../types"

type AuthContextType = {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setUserCredits: (credits: number) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  setUserCredits: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userCredits, setUserCredits] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        setUser(null)
        setSession(null)

        router.push("/")
        router.refresh()
      } catch (error) {
        console.error("Signout error:", error)
        throw error
      }
    },
    setUserCredits,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const useAuthenticatedUser = () => {
  const { user } = useAuth()
  if (!user) {
    throw new Error("User is not authenticated")
  }
  return user
}

