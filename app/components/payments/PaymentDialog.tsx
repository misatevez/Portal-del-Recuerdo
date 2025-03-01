"use client"

import { useState, useEffect } from "react"
import { X, Loader } from "lucide-react"
import Script from "next/script"
import { updateUserCredits } from "../../lib/supabase"
import { useAuth } from "../../auth/AuthProvider"

interface PaymentDialogProps {
  planId: string
  planName: string
  price: number
  onClose: () => void
  onSuccess: () => void
  onError: (error?: string) => void
}

export function PaymentDialog({ planId, planName, price, onClose, onSuccess, onError }: PaymentDialogProps) {
  const [preferenceId, setPreferenceId] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    createPreference()
  }, [])

  const createPreference = async () => {
    try {
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Crédito Premium - ${planName}`,
          price,
          quantity: 1
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la preferencia de pago")
      }

      const data = await response.json()
      setPreferenceId(data.id)
      setLoading(false)
    } catch (error) {
      console.error("Error creating preference:", error)
      onError(error instanceof Error ? error.message : "Error al crear la preferencia de pago")
    }
  }

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
    } catch (error) {
      console.error("Error en el pago:", error)
      // Asegurarse de que el error tenga un mensaje
      const errorMessage = (error as Error).message || "Error desconocido"
      onError(errorMessage)
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <>
      <Script 
        src="https://sdk.mercadopago.com/js/v2" 
        strategy="afterInteractive"
        onLoad={() => {
          if (preferenceId) {
            // @ts-ignore
            const mp = new MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
              locale: 'es-AR'
            })

            mp.checkout({
              preference: {
                id: preferenceId
              },
              render: {
                container: '#payment-form',
                label: 'Pagar ahora',
                type: 'wallet'
              },
              theme: {
                elementsColor: '#c9ab81',
                headerColor: '#1a2f25',
              }
            })
          }
        }}
      />

      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a2f25] border border-primary/20 w-full max-w-md rounded-lg shadow-2xl">
          {/* Header */}
          <div className="bg-primary/10 p-6 rounded-t-lg border-b border-primary/20">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-andika text-primary">Comprar Crédito Premium</h2>
              <button 
                onClick={onClose} 
                className="text-text/60 hover:text-text p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-surface rounded-lg border border-primary/20">
                  <p className="text-text/80 font-montserrat">
                    <span className="block text-lg mb-2">Plan: {planName}</span>
                    <span className="block text-3xl text-primary font-semibold">
                      ${price.toLocaleString()}
                    </span>
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div id="payment-form" className="w-full bg-surface p-4 rounded-lg"></div>
                  <p className="text-sm text-text/60 text-center mt-4">
                    Pago seguro procesado por MercadoPago
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

