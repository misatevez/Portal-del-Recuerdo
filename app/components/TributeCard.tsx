import Link from "next/link"
import { format } from "date-fns"
import { Edit, Trash2, Star } from "lucide-react"

interface TributeCardProps {
  id: string
  slug: string
  nombre: string
  fechaNacimiento: string
  fechaFallecimiento: string
  imagen: string
  isOwner: boolean
  onEdit: (slug: string) => void
  onDelete: () => void
  onTogglePremium: () => void
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return format(date, "dd/MM/yyyy")
}

export function TributeCard({
  id,
  slug,
  nombre,
  fechaNacimiento,
  fechaFallecimiento,
  imagen,
  isOwner,
  onEdit,
  onDelete,
  onTogglePremium,
}: TributeCardProps) {
  return (
    <Link href={`/homenaje/${slug || id}`} className="block group">
      <div className="pointer-events-auto">
        <div className="flex flex-col items-center relative group">
          {isOwner && (
            <div className="absolute top-0 right-0 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(slug)
                }}
                className="p-1 bg-primary text-background rounded-full"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 bg-red-500 text-background rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onTogglePremium()
                }}
                className="p-1 bg-yellow-500 text-background rounded-full"
              >
                <Star className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="relative w-48 h-48 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-primary/50 p-[2px]">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/20">
                <img src={imagen || "/placeholder.svg"} alt={nombre} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <h3 className="font-andika text-xl text-primary text-center mb-1">{nombre}</h3>
          <p className="font-montserrat text-sm text-primary/80 text-center">
            {formatDate(fechaNacimiento)} - {formatDate(fechaFallecimiento)}
          </p>
        </div>
      </div>
    </Link>
  )
}

