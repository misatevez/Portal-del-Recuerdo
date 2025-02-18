import Image from "next/image"
import { Trash2, Edit } from "lucide-react"
import type { PhotoGalleryProps } from "../../types"

export function PhotoGallery({ photos, canEdit, onUpload, onDelete, onUpdateDescription }: PhotoGalleryProps) {
  return (
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
      {canEdit && (
        <div className="w-full h-64 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
          <label htmlFor="photo-upload" className="cursor-pointer">
            <span className="text-primary hover:text-primary/80">Subir Foto</span>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onUpload(file)
                }
              }}
            />
          </label>
        </div>
      )}
    </div>
  )
}

