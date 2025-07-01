"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation' // Importante: usar 'next/navigation' en App Router

import type { SupabaseClient, Session } from '@supabase/auth-helpers-nextjs'

type SupabaseContext = {
  supabase: SupabaseClient
  session: Session | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function AuthProvider({ children, session: serverSession }: { children: React.ReactNode; session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [session, setSession] = useState(serverSession)

  // Este useEffect es el corazón de la solución.
  // Escucha cualquier cambio en el estado de autenticación (SIGNED_IN, SIGNED_OUT).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Actualizamos el estado de la sesión en el cliente inmediatamente.
      setSession(newSession)

      // Refrescamos el router para sincronizar los Server Components.
      router.refresh()
    })

    // Nos aseguramos de limpiar la suscripción cuando el componente se desmonta.
    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  return (
    <Context.Provider value={{ supabase, session }}>
      {children}
    </Context.Provider>
  )
}

// Hook personalizado para acceder fácilmente al contexto en otros componentes.
export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase debe ser usado dentro de un AuthProvider.')
  }
  return context
}
