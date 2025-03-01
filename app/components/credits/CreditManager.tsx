"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { toast } from "react-hot-toast"
import { CreditCard, Plus, Check } from "lucide-react"
import type { UserCredit, Tribute } from "../../types"

interface CreditManagerProps {
  userId: string
  tribute?: Tribute
  onCreditApplied?: () => void
}

export function CreditManager({ userId, tribute, onCreditApplied }: CreditManagerProps) {
  const [credits, setCredits] = useState<UserCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    loadCredits()
  }, [userId])

  const loadCredits = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCredits(data || [])
    } catch (error) {
      console.error('Error al cargar créditos:', error)
      toast.error('No se pudieron cargar tus créditos')
    } finally {
      setLoading(false)
    }
  }

  const purchaseCredit = async () => {
    try {
      setPurchasing(true)
      
      // Llamar al endpoint de compra
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al comprar crédito')
      }
      
      toast.success('¡Crédito comprado con éxito!')
      loadCredits() // Recargar los créditos
    } catch (error) {
      console.error('Error al comprar crédito:', error)
      toast.error('No se pudo completar la compra')
    } finally {
      setPurchasing(false)
    }
  }

  const applyCredit = async () => {
    if (!tribute) return
    
    try {
      setApplying(true)
      
      // Llamar al endpoint para aplicar el crédito
      const response = await fetch('/api/tributes/apply-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tributeId: tribute.id })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al aplicar crédito premium')
      }
      
      toast.success('¡Homenaje actualizado a premium con éxito!')
      
      if (onCreditApplied) {
        onCreditApplied()
      }
      
      loadCredits() // Recargar los créditos
    } catch (error) {
      console.error('Error al aplicar crédito:', error)
      toast.error('No se pudo aplicar el crédito premium')
    } finally {
      setApplying(false)
    }
  }

  // Contar créditos disponibles (no usados)
  const availableCredits = credits.filter(credit => !credit.used_at).length

  return (
    <div className="bg-surface p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-andika text-primary mb-4 flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Tus Créditos Premium
      </h3>
      
      {loading ? (
        <p className="text-text/60 font-montserrat">Cargando créditos...</p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-text/80 font-montserrat">
              Créditos disponibles: <span className="font-semibold">{availableCredits}</span>
            </p>
            <p className="text-text/60 text-sm font-montserrat mt-1">
              Total de créditos: {credits.length}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={purchaseCredit}
              disabled={purchasing}
              className="elegant-button px-4 py-2 rounded-md font-andika flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              {purchasing ? 'Procesando...' : 'Comprar Crédito'}
            </button>
            
            {tribute && !tribute.es_premium && availableCredits > 0 && (
              <button
                onClick={applyCredit}
                disabled={applying}
                className="px-4 py-2 border border-primary/30 rounded-md text-text hover:bg-primary/10 font-andika flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                {applying ? 'Aplicando...' : 'Aplicar a este Homenaje'}
              </button>
            )}
          </div>
          
          {tribute && tribute.es_premium && (
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <p className="text-text/80 font-montserrat text-sm">
                Este homenaje ya es premium
                {tribute.premium_until && (
                  <> hasta el {new Date(tribute.premium_until).toLocaleDateString()}</>
                )}
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-text/80 font-montserrat mb-2">Historial de Créditos</h4>
            {credits.length > 0 ? (
              <ul className="space-y-2">
                {credits.map(credit => (
                  <li key={credit.id} className="text-sm text-text/70 font-montserrat border-b border-primary/10 pb-2">
                    <div className="flex justify-between">
                      <span>Crédito {credit.used_at ? 'usado' : 'disponible'}</span>
                      <span>{new Date(credit.created_at).toLocaleDateString()}</span>
                    </div>
                    {credit.used_at && (
                      <div className="text-xs text-text/50 mt-1">
                        Usado el {new Date(credit.used_at).toLocaleDateString()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text/60 text-sm font-montserrat">No tienes créditos aún</p>
            )}
          </div>
        </>
      )}
    </div>
  )
} 