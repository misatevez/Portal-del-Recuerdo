import { Heart, MessageCircle } from "lucide-react"
import { ShareButton } from "../sharing/ShareButton"
import { useAuth } from "../../auth/AuthProvider"
import type { TributeActionsProps } from "../../types"

export function TributeActions({ onLightCandle, onScrollToComments, slug, name }: TributeActionsProps) {
  const { user } = useAuth()
  return (
    <div className="flex flex-wrap gap-4 mb-12">
      <button
        onClick={onLightCandle}
        disabled={!user}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
          user ? "bg-primary text-background hover:bg-primary/80" : "bg-gray-400 text-gray-600 cursor-not-allowed"
        } relative group`}
      >
        <Heart className="w-5 h-5" />
        Encender Vela
        {!user && (
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {user === null ? "Por favor, inicia sesión para encender una vela." : "Cargando estado de usuario..."}
          </span>
        )}
      </button>
      <button
        onClick={onScrollToComments}
        className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-text rounded-md hover:bg-primary/10"
      >
        <MessageCircle className="w-5 h-5" />
        Dejar Mensaje
      </button>
      <ShareButton tributeSlug={slug} tributeName={name} className="text-text/60 hover:text-primary" />
    </div>
  )
}

