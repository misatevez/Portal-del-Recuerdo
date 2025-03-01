"use client"

import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"

export default function BannedPage() {
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      await supabase.auth.signOut()
    }

    // Cerrar sesión automáticamente
    handleSignOut()
  }, [])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-andika text-primary mb-4">Cuenta Suspendida</h1>
        <p className="text-text/80 font-montserrat mb-6">
          Tu cuenta ha sido suspendida por violar nuestros términos de servicio. 
          Si crees que esto es un error, por favor contacta a nuestro equipo de soporte.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full px-4 py-2 bg-primary text-white rounded-md font-andika hover:bg-primary/90"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  )
} 