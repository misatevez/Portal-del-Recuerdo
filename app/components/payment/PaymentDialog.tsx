"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"
import { supabase } from "../../lib/supabase"

interface PaymentDialogProps {
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export function PaymentDialog({ onClose, onSuccess, userId }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    try {
      setLoading(true)
      // Aquí irá la lógica de pago real
      const { error } = await supabase
        .from("credits")
        .upsert({ user_id: userId, amount: 1 })

      if (error) throw error
      
      toast.success("Crédito comprado exitosamente")
      onSuccess()
    } catch (error) {
      console.error("Error en la compra:", error)
      toast.error("Error al procesar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-andika text-primary">Comprar Crédito Premium</h2>
          <button onClick={onClose} className="text-text/60 hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-text/80 font-montserrat">
            Precio: $12.000
          </p>
          
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="elegant-button w-full py-2 rounded-md font-andika"
          >
            {loading ? "Procesando..." : "Confirmar Compra"}
          </button>
        </div>
      </div>
    </div>
  )
} 