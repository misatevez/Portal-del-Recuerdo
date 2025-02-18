"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { user, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const navLinkClass = "text-text hover:text-primary transition-colors font-andika"
  const supabase = createClientComponentClient()

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
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // ... resto del componente sin cambios
}

