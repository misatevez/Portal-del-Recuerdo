"use client"

import { useState } from "react"
import { Loader } from "lucide-react"
import { useSupabase } from "../../auth/AuthProvider"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface PaymentDialogProps {
  planId: string
  planName: string
  price: number
  onClose: () => void
  onSuccess: () => void
  onError?: () => void
}

export function PaymentDialog({ planId, planName, price, onClose, onSuccess, onError }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const { session } = useSupabase()
  const user = session?.user
  const router = useRouter()

  const handlePayment = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tributeId: user?.id,
          productTitle: `Plan Premium - ${planName}`,
          price: price
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la preferencia de pago")
      }

      const data = await response.json()
      if (data.init_point) {
        // Redirigir al usuario a la página de pago de MercadoPago
        window.location.href = data.init_point
      } else {
        throw new Error("No se recibió el link de pago")
      }
    } catch (error) {
      console.error("Error creating preference:", error)
      toast.error("Error al procesar el pago. Por favor, intenta de nuevo.")
      setLoading(false)
      onClose() // Cerramos el diálogo en caso de error
      onError?.() // Llamamos a onError si existe
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="elegant-button w-full py-2 px-4 rounded-md text-background"
    >
      {loading ? (
        <>
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
          </div>
        </>
      ) : (
        'Seleccionar Plan'
      )}
    </button>
  )
}

