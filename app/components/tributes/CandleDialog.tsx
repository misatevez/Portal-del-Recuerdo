"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { AnimatedCandle } from "../AnimatedCandle"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../auth/AuthProvider"
import toast from "react-hot-toast"

interface CandleDialogProps {
  onClose: () => void
  tributeId: string
  onCandleLit: (newCandle: any) => void
}

// Changed from 'function CandleDialog' to 'export default function CandleDialog'
export default function CandleDialog({ onClose, tributeId, onCandleLit }: CandleDialogProps) {
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
          estado: "pendiente", // Establecer estado inicial como pendiente
        })
        .select("*, profiles:user_id(nombre)")
        .single()

      if (error) throw error

      // Pasar la vela recién creada al componente padre
      onCandleLit(data)
      onClose()
      
      // Mostrar notificación de éxito
      toast.success("Tu vela ha sido encendida y está pendiente de aprobación", {
        duration: 5000,
        icon: '🕯️',
      })
    } catch (error) {
      console.error("Error al encender la vela:", error)
      toast.error("Error al encender la vela. Por favor, inténtalo de nuevo.")
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
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <AnimatedCandle className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <p className="text-text/80 font-montserrat mb-4 text-center">
          Enciende una vela en memoria de este ser querido. Tu vela aparecerá una vez sea aprobada.
        </p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje (opcional)"
            className="elegant-input w-full px-3 py-2 rounded-md font-montserrat mb-1"
            rows={4}
            maxLength={100}
          />
          <div className="text-right text-xs text-text/60 mb-4">
            {message.length} / 100
          </div>
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

