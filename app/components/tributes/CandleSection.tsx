"use client"

import React, { useState, useEffect } from "react"
import type { CandleSectionProps } from "../../types"

export function CandleSection({ candles, tributeId }: CandleSectionProps) {
  const [candleCount, setCandleCount] = useState(candles?.count || 0)

  useEffect(() => {
    setCandleCount(candles?.count || 0)
  }, [candles])

  const [showCandleDialog, setShowCandleDialog] = React.useState(false)

  const handleLightCandle = () => {
    // TODO: Implement candle lighting functionality
    setShowCandleDialog(true)
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-andika text-primary mb-6">Velas Encendidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: candleCount }).map((_, index) => (
          <div key={index} className="bg-surface p-4 rounded-lg text-center">
            <div className="w-8 h-12 bg-yellow-300 mx-auto mb-2 animate-flicker"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

