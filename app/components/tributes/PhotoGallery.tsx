import { Trash2, Upload, Info } from "lucide-react"
import type { PhotoGalleryProps as GalleryProps, Photo } from "../../types"
import { useState, useRef } from "react"
import { toast } from "react-hot-toast"
// Importar Swiper y sus estilos
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface PhotoGalleryProps {
  photos: Photo[]
  canEdit: boolean
  onUpload: (file: File) => void
  onDelete: (id: string) => void
  isPremium?: boolean
  photoLimit?: number | null
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
const MAX_PHOTOS = 30;

export function PhotoGallery({
  photos,
  canEdit,
  onUpload,
  onDelete,
  isPremium = false,
  photoLimit = null
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('El tamaño máximo permitido es 5MB por foto');
        return;
      }

      if (photos.length >= MAX_PHOTOS) {
        toast.error(`Has alcanzado el límite de ${MAX_PHOTOS} fotos`);
        return;
      }

      onUpload(file)
      e.target.value = ""
    }
  }

  const canUploadMore = photos.length < MAX_PHOTOS;

  return (
    <section className="mb-12 bg-surface/30 rounded-lg p-6 shadow-md overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-andika text-primary">
          Galería de Fotos {photos.length > 0 && `(${photos.length}/${MAX_PHOTOS})`}
        </h2>
        {canEdit && isPremium && canUploadMore && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="elegant-button px-4 py-2 rounded-md font-andika flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Subir Foto
            </button>
          </div>
        )}
      </div>

      {!isPremium && photoLimit !== null && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="font-montserrat text-sm flex items-center text-text/80">
            <Info className="w-4 h-4 mr-2 text-primary" />
            {photos.length >= photoLimit 
              ? "Has alcanzado el límite de fotos para homenajes gratuitos. Actualiza a premium para subir más fotos."
              : `Puedes subir ${photoLimit - photos.length} foto${photoLimit - photos.length !== 1 ? 's' : ''} más con tu homenaje gratuito.`
            }
          </p>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="relative max-w-3xl mx-auto overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            loop={photos.length > 1}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3
            }}
            className="!px-10 !pb-12 swiper-contained"
            breakpoints={{
              480: {
                slidesPerView: Math.min(2, photos.length),
                spaceBetween: 20,
              },
              768: {
                slidesPerView: Math.min(3, photos.length),
                spaceBetween: 25,
              }
            }}
          >
            {photos.map((photo) => (
              <SwiperSlide key={photo.id}>
                <div className="relative group w-full aspect-[4/3] h-[180px] rounded-lg overflow-hidden mx-auto">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.descripcion || "Foto del homenaje"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onClick={() => {
                      setSelectedPhoto(photo)
                      setIsViewerOpen(true)
                    }}
                  />
                  {photo.descripcion && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                      {photo.descripcion}
                    </div>
                  )}
                  {canEdit && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(photo.id)
                        }}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="text-center py-12 bg-primary/5 rounded-lg max-w-3xl mx-auto">
          <p className="text-text/60 font-montserrat">
            No hay fotos en la galería{canEdit && canUploadMore ? ". Haz clic en 'Subir Foto' para añadir la primera." : "."}
          </p>
        </div>
      )}

      {/* Modal para ver la foto en tamaño completo */}
      {isViewerOpen && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center cursor-pointer"
          onClick={() => setIsViewerOpen(false)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4 relative">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.descripcion || "Foto del homenaje"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selectedPhoto.descripcion && (
              <p className="text-white text-center mt-4 font-montserrat">
                {selectedPhoto.descripcion}
              </p>
            )}
            <button 
              className="absolute top-2 right-2 text-white/80 hover:text-white"
              onClick={() => setIsViewerOpen(false)}
            >
              <span className="sr-only">Cerrar</span>
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

