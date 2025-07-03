"use client"

import { useState, useEffect } from "react"
import { Crown, Star } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { PaymentDialog } from "../payments/PaymentDialog"
import type { Tribute } from "../../types"
import { toast } from "react-hot-toast"

interface CreditManagerProps {
  userId: string
  showTitle?: boolean
  className?: string
  tribute?: Tribute
  onCreditApplied?: () => void
  renderAs?: "card" | "button"
}

export function CreditManager({ 
  userId, 
  showTitle = true, 
  className = "",
  tribute,
  onCreditApplied,
  renderAs = "card"
}: CreditManagerProps) {
  const [credits, setCredits] = useState(0)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCredits()
  }, [userId])

  const loadCredits = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setCredits(data?.credits || 0)
    } catch (error) {
      console.error("Error loading credits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCredit = async () => {
    if (!tribute) return

    try {
      setLoading(true)
      // Actualizar el estado premium del tributo
      await supabase
        .from("tributes")
        .update({ es_premium: true })
        .eq("id", tribute.id)

      // Decrementar los créditos del usuario en la tabla profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: credits - 1 })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Recargar los créditos
      await loadCredits()
      
      // Notificar que se aplicó el crédito
      onCreditApplied?.()
      
      toast.success("Crédito aplicado exitosamente")
    } catch (error) {
      console.error("Error applying credit:", error)
      toast.error("Error al aplicar el crédito")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  if (renderAs === "button") {
    if (!tribute || credits === 0) {
      return null
    }

    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleApplyCredit()
        }}
        disabled={loading}
        className="p-1 bg-yellow-500 text-background rounded-full"
        title="Hacer Premium con 1 crédito"
      >
        <Star className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className={`elegant-card p-6 rounded-lg ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-medium text-primary font-andika">Créditos Premium</h3>
        </div>
      )}
      
      <p className="text-text/80 font-montserrat mb-4">
        Créditos disponibles: {credits}
      </p>

      <div className="space-y-4">
        {tribute && credits > 0 && (
          <button
            onClick={handleApplyCredit}
            className="elegant-button w-full px-4 py-2 rounded-md font-andika"
          >
            Aplicar Crédito a este Homenaje
          </button>
        )}
        
        <button
          onClick={() => setShowPaymentDialog(true)}
          className="elegant-button px-4 py-2 rounded-md font-andika"
        >
          Comprar Créditos
        </button>
      </div>

      {showPaymentDialog && (
        <PaymentDialog
          planId="premium_credit"
          planName="Crédito Premium"
          price={12000}
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={() => {
            loadCredits() // Recargar los créditos después del pago exitoso
            toast.success("¡Pago procesado exitosamente!")
            setShowPaymentDialog(false)
          }}
        />
      )}
    </div>
  )
} 