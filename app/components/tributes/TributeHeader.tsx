import { Calendar, MapPin, Star } from "lucide-react"
import { ShareButton } from "../sharing/ShareButton"
import { Edit, Trash2 } from "lucide-react"
import type { TributeHeaderProps } from "../../types"

export function TributeHeader({
  tribute,
  isOwner,
  onEdit,
  onDelete,
  onUpdatePremiumStatus,
  onBuyCredit,
}: TributeHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden">
          <img
            src={tribute.imagen_principal || "/placeholder.svg"}
            alt={tribute.nombre}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-andika text-primary mb-2">{tribute.nombre}</h1>
          <div className="flex items-center gap-4 text-text/60 font-montserrat">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(tribute.fecha_nacimiento).getFullYear()} - {new Date(tribute.fecha_fallecimiento).getFullYear()}
            </span>
            {tribute.ubicacion && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {tribute.ubicacion}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">

        {isOwner && (
          <>
            <button onClick={onEdit} className="text-text/60 hover:text-primary" aria-label="Edit tribute">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700" aria-label="Delete tribute">
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => (tribute.es_premium ? onUpdatePremiumStatus(false) : onBuyCredit())}
              className={`text-text/60 hover:text-primary ${tribute.es_premium ? "text-yellow-500" : ""}`}
              aria-label={tribute.es_premium ? "Remove premium status" : "Buy premium credit"}
            >
              <Star className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

