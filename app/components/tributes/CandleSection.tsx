"use client"
import { useState } from "react"
import { Check, X } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { toast } from "react-hot-toast"
import type { CandleSectionProps, Candle } from "../../types"
import { CandleAnimation } from "./CandleAnimation"

export function CandleSection({ candles = [], tributeId, isOwner }: CandleSectionProps) {
  const [pendingCandles, setPendingCandles] = useState<Candle[]>(
    candles.filter((candle) => candle.estado === "pendiente"),
  )
  const [approvedCandles, setApprovedCandles] = useState<Candle[]>(
    candles.filter((candle) => candle.estado === "aprobado"),
  )

  const handleApprove = async (candleId: string) => {
    try {
      const { error } = await supabase.from("candles").update({ estado: "aprobado" }).eq("id", candleId)

      if (error) throw error

      // Actualizar estados locales
      const approvedCandle = pendingCandles.find((c) => c.id === candleId)
      if (approvedCandle) {
        setPendingCandles((prev) => prev.filter((c) => c.id !== candleId))
        setApprovedCandles((prev) => [...prev, { ...approvedCandle, estado: "aprobado" }])
      }

      toast.success("Vela aprobada exitosamente")
    } catch (error) {
      console.error("Error al aprobar la vela:", error)
      toast.error("Error al aprobar la vela")
    }
  }

  const handleReject = async (candleId: string) => {
    try {
      const { error } = await supabase.from("candles").update({ estado: "rechazado" }).eq("id", candleId)

      if (error) throw error

      // Remover de la lista de pendientes
      setPendingCandles((prev) => prev.filter((c) => c.id !== candleId))
      toast.success("Vela rechazada")
    } catch (error) {
      console.error("Error al rechazar la vela:", error)
      toast.error("Error al rechazar la vela")
    }
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-andika text-primary mb-6">Velas Encendidas ({approvedCandles.length})</h2>

      {/* Sección de velas pendientes (solo visible para el dueño) */}
      {isOwner && pendingCandles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-andika text-primary/80 mb-4">
            Velas Pendientes de Aprobación ({pendingCandles.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendingCandles.map((candle) => (
              <div key={candle.id} className="elegant-card p-4 rounded-lg">
                <CandleAnimation />
                {candle.mensaje && (
                  <p className="mt-3 text-sm text-text/80 font-montserrat line-clamp-3">{candle.mensaje}</p>
                )}
                <p className="mt-2 text-xs text-text/60 font-montserrat">{candle.profiles?.nombre || "Anónimo"}</p>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(candle.id)}
                    className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 rounded-full"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(candle.id)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de velas aprobadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {approvedCandles.map((candle) => (
          <div key={candle.id} className="elegant-card p-4 rounded-lg text-center">
            <CandleAnimation />
            {candle.mensaje && (
              <p className="mt-3 text-sm text-text/80 font-montserrat line-clamp-3">{candle.mensaje}</p>
            )}
            <p className="mt-2 text-xs text-text/60 font-montserrat">{candle.profiles?.nombre || "Anónimo"}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

