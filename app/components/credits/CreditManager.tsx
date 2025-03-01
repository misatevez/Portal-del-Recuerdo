"use client"

import { useState, useEffect } from "react"
import { Crown } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { PaymentDialog } from "../payment/PaymentDialog"

interface CreditManagerProps {
  userId: string
  showTitle?: boolean
  className?: string
}

export function CreditManager({ userId, showTitle = true, className = "" }: CreditManagerProps) {
  const [credits, setCredits] = useState(0)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCredits()
  }, [userId])

  const loadCredits = async () => {
    try {
      const { data, error } = await supabase
        .from("credits")
        .select("amount")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setCredits(data?.amount || 0)
    } catch (error) {
      console.error("Error loading credits:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

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
      
      <button
        onClick={() => setShowPaymentDialog(true)}
        className="elegant-button px-4 py-2 rounded-md font-andika"
      >
        Comprar Créditos
      </button>

      {showPaymentDialog && (
        <PaymentDialog
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={() => {
            loadCredits()
            setShowPaymentDialog(false)
          }}
          userId={userId}
        />
      )}
    </div>
  )
} 