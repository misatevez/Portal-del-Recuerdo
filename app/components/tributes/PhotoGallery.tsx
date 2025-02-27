import Image from "next/image"
import { Trash2, Edit, Upload, Info } from "lucide-react"
import type { PhotoGalleryProps } from "../../types"
import { useState, useRef } from "react"
import { toast } from "react-hot-toast"

interface PhotoGalleryProps {
  photos: Photo[]
  canEdit: boolean
  onUpload: (file: File) => void
  onDelete: (id: string) => void
  onUpdateDescription: (id: string, description: string) => void
  isPremium?: boolean
  photoLimit?: number | null
}

export function PhotoGallery({
  photos,
  canEdit,
  onUpload,
  onDelete,
  onUpdateDescription,
  isPremium = false,
  photoLimit = null
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      e.target.value = ""
    }
  }

  const handleUploadClick = () => {
    // Verificar si se ha alcanzado el límite de fotos
    if (photoLimit !== null && photos.length >= photoLimit) {
      toast.error(
        `Has alcanzado el límite de ${photoLimit} fotos para homenajes gratuitos. Actualiza a premium para subir más fotos.`,
        { duration: 5000 }
      )
      return
    }
    
    fileInputRef.current?.click()
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-andika text-primary">Galería de Fotos</h2>
        {canEdit && isPremium && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              className="elegant-button px-4 py-2 rounded-md font-andika flex items-center gap-2"
            
            >
              <Upload className="w-5 h-5" />
              Subir Foto
            </button>
          </div>
        )}
      </div>

      {/* Mostrar información sobre el límite de fotos */}
      {!isPremium && photoLimit !== null && (
        <div className="mb-4 p-3 bg-primary/10 rounded-md">
          <p className="font-montserrat text-sm flex items-center">
            <Info className="w-4 h-4 mr-2 text-primary" />
            {photos.length >= photoLimit 
              ? "Has alcanzado el límite de fotos para homenajes gratuitos. Actualiza a premium para subir más fotos."
              : `Puedes subir ${photoLimit - photos.length} foto${photoLimit - photos.length !== 1 ? 's' : ''} más con tu homenaje gratuito.`
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <Image
              src={photo.url || "/placeholder.svg"}
              alt={photo.descripcion || "Foto del homenaje"}
              width={300}
              height={300}
              className="w-full h-64 object-cover rounded-lg"
            />
            {canEdit && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDelete(photo.id)} className="p-2 bg-red-600 text-white rounded-full mr-2">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newDescription = prompt("Nueva descripción:", photo.descripcion)
                    if (newDescription !== null) {
                      onUpdateDescription(photo.id, newDescription)
                    }
                  }}
                  className="p-2 bg-blue-600 text-white rounded-full"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

