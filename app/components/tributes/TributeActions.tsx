"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, MessageCircle } from "lucide-react"
import { ShareButton } from "../sharing/ShareButton"
import { useAuth } from "../../auth/AuthProvider"
import type { TributeActionsProps } from "../../types"

export function TributeActions({ onLightCandle, onScrollToComments, slug, name }: TributeActionsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLightCandle = async () => {
    console.log("Botón Encender Vela clickeado")
    console.log("Estado del usuario:", user)

    if (!user) {
      console.log("Usuario no autenticado, redirigiendo a login")
      router.push("/login")
      return
    }

    try {
      setLoading(true)
      console.log("Llamando a onLightCandle")
      await onLightCandle()
      console.log("onLightCandle ejecutado exitosamente")
    } catch (error) {
      console.error("Error al encender la vela:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-4 mb-12">
      <button
        onClick={handleLightCandle}
        disabled={loading}
        className={`elegant-button flex items-center gap-2 px-4 py-2 rounded-md ${
          !user ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Heart className="w-5 h-5" />
        {loading ? "Encendiendo..." : "Encender Vela"}
      </button>
      <button
        onClick={onScrollToComments}
        className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-text rounded-md hover:bg-primary/10"
      >
        <MessageCircle className="w-5 h-5" />
        Dejar Mensaje
      </button>
      <ShareButton tributeSlug={slug} tributeName={name} className="text-text/60 hover:text-primary" />
    </div>
  )
}

