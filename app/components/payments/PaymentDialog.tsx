"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { updateUserCredits } from "../../lib/supabase"
import { useAuth } from "../../auth/AuthProvider"
import type { PaymentDialogProps } from "../../types"

export function PaymentDialog({ planId, planName, price, onClose, onSuccess, onError }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handlePayment = async () => {
    setLoading(true)
    try {
      // TODO: Implement MercadoPago integration here
      // Simular un pago exitoso
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Actualizar los créditos del usuario
      if (user) {
        await updateUserCredits(user.id, planId, 1) // Añadir 1 crédito premium
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error en el pago:", error)
      onError() // Call onError when there's an error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-surface p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-andika text-primary">Pago con MercadoPago</h3>
          <button onClick={onClose} className="text-text/60 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mb-4 text-text/80">
          Estás a punto de adquirir el plan: <strong>{planName}</strong>
        </p>
        <p className="mb-6 text-text/80">
          Precio: <strong>${price.toFixed(2)}</strong>
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-primary/30 text-text rounded-md hover:bg-primary/10 mr-2"
          >
            Cancelar
          </button>
          <button className="elegant-button px-4 py-2 rounded-md" onClick={handlePayment} disabled={loading}>
            {loading ? "Procesando..." : "Pagar con MercadoPago"}
          </button>
        </div>
      </div>
    </div>
  )
}

