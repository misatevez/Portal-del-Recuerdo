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

  // This effect ensures that the local user state is always in sync with the session
  // provided by the server. This is the "source of truth".
  useEffect(() => {
    setUser(serverSession?.user ?? null);
  }, [serverSession]);

  // This is the definitive 3-rule implementation.
  useEffect(() => {
    console.log('[AuthProvider] Setting up definitive listener.');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, clientSession) => {
      console.log(`[AuthProvider] Event: ${event}`);

      // Rule 1: Always ignore INITIAL_SESSION on the client to prevent flicker.
      if (event === 'INITIAL_SESSION') {
        console.log('[AuthProvider] -> Rule 1: Ignoring INITIAL_SESSION.');
        return;
      }

      // Rule 2: Handle SIGNED_IN for a fast UI response.
      if (event === 'SIGNED_IN') {
        console.log('[AuthProvider] -> Rule 2: SIGNED_IN detected. Optimistically updating UI and refreshing server data.');
        setUser(clientSession?.user ?? null);
        router.refresh();
      } 
      // Rule 3: For all other events, act as a watchdog.
      else if (clientSession?.access_token !== serverSession?.access_token) {
        console.log(`[AuthProvider] -> Rule 3: Watchdog detected mismatch on event '${event}'. Forcing refresh.`);
        router.refresh();
      }
    });

    return () => {
      console.log('[AuthProvider] Unsubscribing definitive listener.');
      subscription.unsubscribe();
    };
  }, [router, supabase, serverSession]);

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
