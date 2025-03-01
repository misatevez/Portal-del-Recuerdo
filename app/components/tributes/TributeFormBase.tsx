"use client"

import { useState, useEffect } from "react"
import { Camera, Calendar, MapPin, Star, Crown, Music, Upload } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { PhotoGallery } from "./PhotoGallery"
import { BackgroundMusic } from "./BackgroundMusic"
import { toast } from "react-hot-toast"
import type { Photo } from "../../types"

const filterPrimaryColor = "invert(65%) sepia(19%) saturate(434%) hue-rotate(356deg) brightness(92%) contrast(86%)"

interface TributeFormBaseProps {
  initialData?: {
    id?: string
    nombre: string
    fechaNacimiento: string
    fechaFallecimiento: string
    ubicacion: string
    biografia: string
    imagenPrincipal: File | null
    isPremium?: boolean
    premiumUntil?: string
  }
  currentImageUrl?: string
  onSubmit: (formData: any) => Promise<void>
  buttonText: string
  userCredits: number
  onBuyCredit: () => void
  isEditing?: boolean
  slug?: string
}

export function TributeFormBase({
  initialData = {
    nombre: "",
    fechaNacimiento: "",
    fechaFallecimiento: "",
    ubicacion: "",
    biografia: "",
    imagenPrincipal: null,
    isPremium: false,
  },
  currentImageUrl = "",
  onSubmit,
  buttonText,
  userCredits,
  onBuyCredit,
  isEditing = false,
  slug = ""
}: TributeFormBaseProps) {
  const [formData, setFormData] = useState(initialData)
  const [characterCount, setCharacterCount] = useState(500 - (initialData.biografia?.length || 0))
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(currentImageUrl)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)

  useEffect(() => {
    if (isEditing && initialData.id && initialData.isPremium) {
      loadPhotos()
    }
  }, [isEditing, initialData.id])

  useEffect(() => {
    const styleTag = document.createElement("style")
    styleTag.textContent = `
      .filter-primary {
        filter: ${filterPrimaryColor};
      }
    `
    document.head.appendChild(styleTag)

    return () => {
      styleTag.remove()
    }
  }, [])

  const loadPhotos = async () => {
    try {
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .eq("tribute_id", initialData.id)

      if (photosError) throw photosError
      setPhotos(photosData || [])
    } catch (error) {
      console.error("Error loading photos:", error)
      toast.error("Error al cargar las fotos")
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!initialData.id) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${initialData.id}_${Date.now()}.${fileExt}`
      const filePath = `tribute_images/${initialData.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("storage")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("storage").getPublicUrl(uploadData.path)

      const { data: photoData, error: photoError } = await supabase
        .from("photos")
        .insert({
          tribute_id: initialData.id,
          url: data.publicUrl,
          descripcion: "",
        })
        .select()
        .single()

      if (photoError) throw photoError

      setPhotos(prevPhotos => [...prevPhotos, photoData])
      toast.success("Foto subida correctamente")
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Error al subir la foto")
    }
  }

  const handlePhotoDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      try {
        const { error } = await supabase.from("photos").delete().eq("id", id)
        if (error) throw error
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== id))
        toast.success("Foto eliminada correctamente")
      } catch (error) {
        console.error("Error deleting photo:", error)
        toast.error("Error al eliminar la foto")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error al procesar el formulario:", error)
      alert("Error al procesar el formulario. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imagenPrincipal: file })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Principal */}
        <div className="elegant-card p-6 rounded-lg">
          <h2 className="text-xl font-andika text-primary mb-6">Información Principal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                required
              />
            </div>

            <div>
              <label htmlFor="ubicacion" className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                <MapPin className="w-4 h-4 inline-block mr-1" />
                Ubicación
              </label>
              <input
                type="text"
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                placeholder="Ciudad, País"
              />
            </div>

            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="dark-calendar-input w-full p-2 rounded-md bg-surface text-text border border-primary/30"
              />
            </div>

            <div>
              <label htmlFor="fechaFallecimiento" className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Fecha de Fallecimiento
              </label>
              <input
                type="date"
                id="fechaFallecimiento"
                value={formData.fechaFallecimiento}
                onChange={(e) => setFormData({ ...formData, fechaFallecimiento: e.target.value })}
                className="dark-calendar-input w-full p-2 rounded-md bg-surface text-text border border-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Biografía */}
        <div className="elegant-card p-6 rounded-lg">
          <h2 className="text-xl font-andika text-primary mb-6">Biografía</h2>
          <textarea
            id="biografia"
            value={formData.biografia}
            onChange={(e) => {
              const newBiografia = e.target.value.slice(0, 500)
              setFormData({ ...formData, biografia: newBiografia })
              setCharacterCount(500 - newBiografia.length)
            }}
            className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
            rows={6}
            placeholder="Escribe una breve biografía..."
            maxLength={500}
          />
          <p className="mt-2 text-sm text-text/60 font-montserrat">Caracteres restantes: {characterCount}</p>
        </div>

        {/* Imagen Principal */}
        <div className="elegant-card p-6 rounded-lg">
          <h2 className="text-xl font-andika text-primary mb-6">
            <Camera className="w-5 h-5 inline-block mr-2" />
            Imagen Principal
          </h2>

          {imagePreview && (
            <div className="mb-4">
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="w-40 h-40 object-cover rounded-lg border border-primary/20"
              />
            </div>
          )}

          <div className="mt-2">
            <label className="block">
              <span className="sr-only">Seleccionar imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-text/60 font-montserrat
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/10 file:text-primary
                  hover:file:bg-primary/20"
              />
            </label>
            <p className="mt-2 text-sm text-text/60 font-montserrat">
              Selecciona una imagen para representar a tu ser querido.
            </p>
          </div>
        </div>

        {/* Componentes Premium */}
        {initialData.isPremium && isEditing && (
          <>
            {/* Galería de Fotos */}
            <div className="elegant-card p-6 rounded-lg">
              <h2 className="text-xl font-andika text-primary mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Galería de Fotos
              </h2>
              <PhotoGallery
                photos={photos}
                canEdit={true}
                onUpload={handlePhotoUpload}
                onDelete={handlePhotoDelete}
                isPremium={true}
              />
            </div>

            {/* Música de Fondo */}
            <div className="elegant-card p-6 rounded-lg">
              <h2 className="text-xl font-andika text-primary mb-6 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Música de Fondo
              </h2>
              <div className="bg-surface/30 p-4 rounded-lg">
                <BackgroundMusic
                  tributeId={initialData.id || ""}
                  canEdit={true}
                />
              </div>
            </div>
          </>
        )}

        {/* Opción Premium (para usuarios no premium) */}
        {!initialData.isPremium && (
          <div className="elegant-card p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-andika text-primary">Homenaje Premium</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-andika text-primary">Beneficios Premium:</h3>
                <ul className="space-y-2 text-text/80">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    Galería de hasta 30 fotos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    Música de fondo personalizada
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    Diseño destacado en el listado
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    Sin límites de tiempo
                  </li>
                </ul>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                {userCredits > 0 ? (
                  <div className="space-y-4">
                    <p className="text-text/80">Créditos disponibles: {userCredits}</p>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPremium}
                        onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                        formData.isPremium ? "bg-primary" : "bg-gray-400"
                      }`}>
                        <div className={`absolute left-0 w-6 h-6 transition-transform duration-200 ease-in-out transform bg-white rounded-full ${
                          formData.isPremium ? "translate-x-full" : "translate-x-0"
                        }`} />
                      </div>
                      <span className="ml-3 text-sm font-medium text-text/80">
                        {formData.isPremium ? "Premium" : "Estándar"}
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-6 bg-primary/5 rounded-lg">
                    <p className="text-lg font-andika">
                      Actualiza ahora por solo
                      <span className="block text-3xl text-primary mt-2">$12.000</span>
                    </p>
                    <button
                      type="button"
                      onClick={onBuyCredit}
                      className="elegant-button px-6 py-3 rounded-md font-andika text-lg w-full"
                    >
                      Comprar Crédito
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-primary/30 rounded-md text-text hover:bg-primary/10 font-andika"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="elegant-button px-6 py-2 rounded-md font-andika disabled:opacity-50"
          >
            {loading ? "Procesando..." : buttonText}
          </button>
        </div>
      </form>
    </div>
  )
}

<style jsx global>{`
  .dark-calendar-input::-webkit-calendar-picker-indicator {
    filter: invert(1) hue-rotate(180deg);
  }
`}</style>

