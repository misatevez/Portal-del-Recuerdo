"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Shield, LogOut, Star } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"
import { NotificationCenter } from "../notifications/NotificationCenter"
import { supabase } from "../lib/supabase"

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, signOut } = useAuth()
  const navLinkClass = "text-text hover:text-primary transition-colors font-andika"

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const { data } = await supabase.from("moderators").select("role").eq("id", user.id).maybeSingle()
        setIsAdmin(data?.role === "admin")
      } catch (err) {
        console.error("Error checking admin status:", err)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
      setMenuAbierto(false) // Close mobile menu after logout
    } catch (error) {
      console.error("Error during logout:", error)
      // Show error to user but don't throw
      alert("Error al cerrar sesión. Por favor, intenta de nuevo.")
    }
  }

  return (
    <nav className="bg-surface/90 backdrop-blur-md border-b border-[#c9ab81]/20 fixed w-full z-50 font-andika">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <img
              src="https://ofydbwoelrfsczadkicf.supabase.co/storage/v1/object/public/storage//logoPDR919.png"
              alt="Portal del Recuerdo"
              className="h-12 w-auto"
            />
          </Link>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explorar" className={navLinkClass}>
              Explorar
            </Link>
            <Link href="/precios" className={navLinkClass}>
              Planes
            </Link>
            {user ? (
              <>
                <Link href="/crear-homenaje" className={navLinkClass}>
                  Crear Homenaje
                </Link>
                {isAdmin && (
                  <Link href="/dashboard" className={navLinkClass}>
                  
                    Dashboard
                  </Link>
                )}
     
                <div className="flex items-center gap-4">
                  <Link href="/perfil" className={navLinkClass}>
                    Mi Perfil
                  </Link>
                  <div className="flex items-center gap-1 text-primary" title={`${user?.credits ?? 0} créditos disponibles`}>
                    <Star className="w-4 h-4" />
                    <span>{user?.credits ?? 0}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className={`${navLinkClass} p-2`} aria-label="Cerrar Sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={navLinkClass}>
                  Iniciar Sesión
                </Link>
                <Link href="/registro" className="elegant-button px-6 py-2 rounded-full text-background">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="md:hidden">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-text hover:text-primary">
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {menuAbierto && (
        <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-[#c9ab81]/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/explorar" className="block px-3 py-2 text-text hover:text-primary rounded-md">
              Explorar
            </Link>
            <Link href="/precios" className="block px-3 py-2 text-text hover:text-primary rounded-md">
              Planes
            </Link>
            {user ? (
              <>
                <Link href="/crear-homenaje" className="block px-3 py-2 text-text hover:text-primary rounded-md">
                  Crear Homenaje
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-text hover:text-primary rounded-md flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link href="/perfil" className="block px-3 py-2 text-text hover:text-primary rounded-md">
                  Mi Perfil
                </Link>
                <div className="px-3 py-2 flex items-center gap-2 text-primary">
                  <Star className="w-4 h-4" />
                  <span>{user?.credits ?? 0} créditos</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block px-3 py-2 text-text hover:text-primary rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-text hover:text-primary rounded-md">
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="block px-3 py-2 text-text hover:text-primary rounded-md elegant-button"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

