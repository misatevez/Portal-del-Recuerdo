"use client"

import { useState } from 'react'
import type { Candle as CandleType } from '../../../types'
import { CandleDialog } from './CandleDialog'
import { AnimatedCandle } from '../AnimatedCandle'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../../auth/AuthProvider'

interface CandleSectionProps {
  initialCandles: CandleType[]
  tributeId: string
  tributeAuthorId: string
}

export function CandleSection({ initialCandles, tributeId, tributeAuthorId }: CandleSectionProps) {
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const [candles, setCandles] = useState<CandleType[]>(initialCandles)

  const handleCandleLit = (newCandle: CandleType) => {
    setCandles(prevCandles => [...prevCandles, newCandle])
  }

  const handleDeleteCandle = async (candleId: string) => {
    if (!confirm('¿Estás seguro de que quieres apagar esta vela?')) return

    const { error } = await supabase
      .from('candles')
      .delete()
      .eq('id', candleId)

    if (error) {
      toast.error('No se pudo apagar la vela. Inténtalo de nuevo.')
    } else {
      setCandles(candles.filter(c => c.id !== candleId))
      toast.success('Vela apagada.')
    }
  }

  const isTributeOwner = user?.id === tributeAuthorId

  return (
    <section className="bg-white/50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-md backdrop-blur-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 font-serif">Velas Encendidas</h3>
        {user && (
          <CandleDialog
            tributeId={tributeId}
            userId={user.id}
            onCandleLit={handleCandleLit}
          />
        )}
      </div>
      {candles.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-4">
          {candles.map((candle) => (
            <div key={candle.id} className="relative group">
              <AnimatedCandle authorName={candle.author_name || 'Anónimo'} />
              {isTributeOwner && (
                <button
                  onClick={() => handleDeleteCandle(candle.id)}
                  className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md hover:bg-red-700"
                  aria-label="Apagar vela"
                >
                  <span className="text-xs">×</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Aún no se han encendido velas. ¡Sé el primero en honrar esta memoria!</p>
      )}
    </section>
  )
}
