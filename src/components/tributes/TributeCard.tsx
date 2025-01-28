import React from "react"
import { Link } from "react-router-dom"
import { CandlestickChartIcon as Candle } from "lucide-react"

interface TributeCardProps {
  id: string
  nombre: string
  fechaNacimiento: string
  fechaFallecimiento: string
  imagen: string
  velasEncendidas: number
}

export function TributeCard({
  id,
  nombre,
  fechaNacimiento,
  fechaFallecimiento,
  imagen,
  velasEncendidas,
}: TributeCardProps) {
  const añoNacimiento = new Date(fechaNacimiento).getFullYear()
  const añoFallecimiento = new Date(fechaFallecimiento).getFullYear()

  return (
    <Link to={`/homenaje/${id}`} className="block text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-48 h-48">
          <div
            className="absolute inset-0 rounded-full bg-cover bg-center border-4 border-white shadow-lg"
            style={{
              backgroundImage: `url(${imagen})`,
            }}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-[#B8860B]">{nombre}</h3>
          <p className="text-[#B8860B]">
            {añoNacimiento}-{añoFallecimiento}
          </p>
          <div className="flex items-center justify-center text-[#B8860B] text-sm">
            <Candle className="w-4 h-4 mr-2" />
            <span>{velasEncendidas} velas encendidas</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

