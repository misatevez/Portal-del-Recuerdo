"use client"

import { useState } from "react"
import { Camera, Calendar, MapPin, Star } from "lucide-react"
import type React from "react" // Added import for React

interface TributeFormBaseProps {
  initialData?: {
    nombre: string
    fechaNacimiento: string
    fechaFallecimiento: string
    ubicacion: string
    biografia: string
    imagenPrincipal: File | null
    isPremium?: boolean
  }
  onSubmit: (formData: any) => Promise<void>
  buttonText: string
  userCredits: number
  onBuyCredit: () => void
}

export function TributeFormBase({ initialData, onSubmit, buttonText, userCredits, onBuyCredit }: TributeFormBaseProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    fechaNacimiento: initialData?.fechaNacimiento || "",
    fechaFallecimiento: initialData?.fechaFallecimiento || "",
    ubicacion: initialData?.ubicacion || "",
    biografia: initialData?.biografia || "",
    imagenPrincipal: initialData?.imagenPrincipal || null,
    isPremium: initialData?.isPremium || false,
  })
  const [characterCount, setCharacterCount] = useState(500 - (initialData?.biografia?.length || 0))
  const [loading, setLoading] = useState(false)

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

  return (
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
              className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
              required
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
              className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
              required
              max={new Date().toISOString().split("T")[0]}
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

        <div className="mt-2">
          <label className="block">
            <span className="sr-only">Seleccionar imagen</span>
            <input
              type="file"
              accept=".jpg, .jpeg, .webp, .png, .gif"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setFormData({ ...formData, imagenPrincipal: file })
              }}
              className="block w-full text-sm text-text/60 font-montserrat
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20"
            />
          </label>
          <p className="mt-2 text-sm text-text/60 font-montserrat">
            Formatos aceptados: JPG, WEBP, PNG, GIF. Tamaño máximo: 5MB.
          </p>
        </div>
        {formData.imagenPrincipal && (
          <p className="mt-2 text-sm text-text/60 font-montserrat">
            Imagen seleccionada: {formData.imagenPrincipal.name}
          </p>
        )}
      </div>

      {/* Opción Premium */}
      <div className="elegant-card p-6 rounded-lg">
        <h2 className="text-xl font-andika text-primary mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Homenaje Premium
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text/80 font-montserrat mb-2">
              Crea un homenaje premium con características adicionales.
            </p>
            <p className="text-text/60 font-montserrat">Créditos disponibles: {userCredits}</p>
          </div>
          {userCredits > 0 ? (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`relative w-10 h-6 transition-colors duration-200 ease-in-out rounded-full ${formData.isPremium ? "bg-primary" : "bg-gray-400"}`}
              >
                <div
                  className={`absolute left-0 w-6 h-6 transition-transform duration-200 ease-in-out transform bg-white rounded-full ${formData.isPremium ? "translate-x-full" : "translate-x-0"}`}
                />
              </div>
              <span className="ml-3 text-sm font-medium text-text/80 font-montserrat">
                {formData.isPremium ? "Premium" : "Estándar"}
              </span>
            </label>
          ) : (
            <button type="button" onClick={onBuyCredit} className="elegant-button px-4 py-2 rounded-md font-andika">
              Comprar Crédito
            </button>
          )}
        </div>
      </div>

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
  )
}

