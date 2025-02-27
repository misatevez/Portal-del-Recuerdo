"use client"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

interface CandleSectionProps {
  candles: any[]
  pendingCandles?: any[]
  tributeId: string
  isOwner: boolean
  currentUser: any
}

export function CandleSection({ candles, pendingCandles = [], tributeId, isOwner, currentUser }: CandleSectionProps) {
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [localCandles, setLocalCandles] = useState(candles)

  // Actualizar el estado local cuando cambian las props
  useEffect(() => {
    console.log("CandleSection recibió candles:", candles.length);
    
    // Imprimir cada vela para depuración
    candles.forEach((candle, index) => {
      console.log(`Vela ${index}:`, candle.id, "Estado:", candle.estado);
    });
    
    console.log("Candles pendientes:", candles.filter(c => c.estado === "pendiente").length);
    console.log("Es propietario:", isOwner);
    
    // Asegurarse de que todas las velas tienen un estado válido
    const validatedCandles = candles.map(candle => {
      if (!candle.estado) {
        console.log("Vela sin estado encontrada, asignando 'pendiente':", candle.id);
        return { ...candle, estado: "pendiente" };
      }
      return candle;
    });
    
    setLocalCandles(validatedCandles);
  }, [candles, isOwner]);

  const handleApprove = async (candleId: string) => {
    setApproving(candleId)
    try {
      const { error } = await supabase
        .from("candles")
        .update({ estado: "aprobado" })
        .eq("id", candleId)

      if (error) throw error
      
      // Actualizar el estado local
      setLocalCandles(prev => 
        prev.map(candle => 
          candle.id === candleId 
            ? { ...candle, estado: "aprobado" } 
            : candle
        )
      )
      
      toast.success("Vela aprobada correctamente")
      
      // Recargar la página después de un breve retraso para asegurar que los cambios se reflejen
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error al aprobar la vela:", error)
      toast.error("Error al aprobar la vela")
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (candleId: string) => {
    setRejecting(candleId)
    try {
      const { error } = await supabase
        .from("candles")
        .update({ estado: "rechazado" })
        .eq("id", candleId)

      if (error) throw error
      
      // Actualizar el estado local
      setLocalCandles(prev => 
        prev.filter(candle => candle.id !== candleId)
      )
      
      toast.success("Vela rechazada correctamente")
      
      // Recargar la página después de un breve retraso para asegurar que los cambios se reflejen
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error al rechazar la vela:", error)
      toast.error("Error al rechazar la vela")
    } finally {
      setRejecting(null)
    }
  }

  // Filtrar velas aprobadas
  const approvedCandles = localCandles.filter(candle => candle.estado === "aprobado")
  
  // Filtrar velas pendientes del usuario actual
  const userPendingCandles = pendingCandles.filter(
    candle => currentUser && candle.user_id === currentUser.id
  )

  // Modificar la lógica de filtrado para ser más permisiva
  const pendingForApproval = localCandles.filter(candle => {
    // Comprobar si el estado es pendiente o si no tiene estado (asumimos pendiente)
    const isPending = candle.estado === "pendiente" || !candle.estado;
    if (isPending) {
      console.log("Vela pendiente encontrada:", candle.id, "Estado:", candle.estado);
    }
    return isPending;
  });

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-andika text-primary mb-6">Velas Encendidas</h2>
      
      {/* Sección de aprobación para el propietario */}
      {isOwner && pendingForApproval.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-andika text-primary mb-4">Velas pendientes de aprobación ({pendingForApproval.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pendingForApproval.map((candle) => (
              <div key={candle.id} className="bg-surface/90 p-4 rounded-lg text-center border border-primary/30 relative">
                {/* Indicador de pendiente */}
                <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-600 text-xs px-2 py-1 rounded-full">
                  Pendiente
                </div>
                
                <div className="flex justify-center mb-2">
                  <Heart className="w-8 h-8 text-primary/70" />
                </div>
                
                <p className="font-montserrat text-sm mb-1">
                  {candle.profiles?.nombre || "Anónimo"}
                </p>
                
                {candle.mensaje && (
                  <p className="text-text/80 text-sm italic mb-3">"{candle.mensaje}"</p>
                )}
                
                <p className="text-text/60 text-xs mb-4">
                  {new Date(candle.created_at).toLocaleDateString()}
                </p>
                
                {/* Botones de aprobación/rechazo */}
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => handleApprove(candle.id)}
                    disabled={approving === candle.id}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600/90 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    title="Aprobar vela"
                  >
                    {approving === candle.id ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(candle.id)}
                    disabled={rejecting === candle.id}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600/90 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    title="Rechazar vela"
                  >
                    {rejecting === candle.id ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {approvedCandles.length === 0 && userPendingCandles.length === 0 && (
        <p className="text-text/60 font-montserrat mb-6">
          Aún no hay velas encendidas. Sé el primero en encender una vela en memoria de este ser querido.
        </p>
      )}
      
      {/* Velas aprobadas */}
      {approvedCandles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {approvedCandles.map((candle) => (
            <div key={candle.id} className="bg-surface p-4 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <p className="font-montserrat text-sm mb-1">
                {candle.profiles?.nombre || "Anónimo"}
              </p>
              {candle.mensaje && (
                <p className="text-text/80 text-sm italic">"{candle.mensaje}"</p>
              )}
              <p className="text-text/60 text-xs mt-2">
                {new Date(candle.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* Velas pendientes del usuario actual */}
      {userPendingCandles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-andika text-primary mb-4">Tus velas pendientes de aprobación</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userPendingCandles.map((candle) => (
              <div key={candle.id} className="bg-surface/50 p-4 rounded-lg text-center border border-primary/20">
                <div className="flex justify-center mb-2">
                  <Heart className="w-8 h-8 text-primary/50" />
                </div>
                <p className="font-montserrat text-sm mb-1">
                  {candle.profiles?.nombre || "Anónimo"}
                </p>
                {candle.mensaje && (
                  <p className="text-text/60 text-sm italic">"{candle.mensaje}"</p>
                )}
                <p className="text-text/40 text-xs mt-2">
                  Pendiente de aprobación
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

