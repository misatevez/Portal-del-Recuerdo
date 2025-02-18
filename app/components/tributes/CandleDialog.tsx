"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../auth/AuthProvider"

interface CandleDialogProps {
  onClose: () => void
  tributeId: string
  onCandleLit: (newCandle: any) => void
}

export function CandleDialog({ onClose, tributeId, onCandleLit }: CandleDialogProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("candles")
        .insert({
          tribute_id: tributeId,
          user_id: user.id,
          mensaje: message.trim() || null,
        })
        .select("*, profiles:user_id(nombre)")
        .single()

      if (error) throw error

      onCandleLit(data)
      onClose()
    } catch (error) {
      console.error("Error al encender la vela:", error)
      alert("Error al encender la vela. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-surface bg-background p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-andika text-primary">Encender una Vela</h3>
          <button onClick={onClose} className="text-text/60 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje (opcional)"
            className="elegant-input w-full px-3 py-2 rounded-md font-montserrat mb-4"
            rows={4}
          />
          <div className="flex justify-end">
            <button type="submit" className="elegant-button px-4 py-2 rounded-md font-andika" disabled={isSubmitting}>
              {isSubmitting ? "Encendiendo..." : "Encender Vela"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

