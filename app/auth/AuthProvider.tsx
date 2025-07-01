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

export default function AuthProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Este useEffect es el corazón de la solución.
  // Escucha cualquier cambio en el estado de autenticación (SIGNED_IN, SIGNED_OUT).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Cuando hay un cambio, no solo actualizamos el estado local, sino que
      // refrescamos el router. Esto le dice a Next.js que vuelva a ejecutar
      // las Server Components y los Route Handlers con la nueva información de sesión.
      // Esto es lo que sincroniza el cliente y el servidor.
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
