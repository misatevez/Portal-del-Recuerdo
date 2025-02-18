"use client"

import { useState, useEffect } from "react"
import { TributeFormBase } from "./TributeFormBase"
import { supabase } from "../../lib/supabase"
import type { Tribute } from "../../types"
import { useRouter } from "next/navigation"

interface EditTributeFormProps {
  slug: string
  onClose?: () => void
}

export function EditTributeForm({ slug, onClose }: EditTributeFormProps) {
  const [tribute, setTribute] = useState<Tribute | null>(null)
  const [userCredits, setUserCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTribute = async () => {
      const { data, error } = await supabase.from("tributes").select("*").eq("slug", slug).single()

      if (error) {
        console.error("Error fetching tribute:", error)
        setLoading(false)
        return
      }

      setTribute(data)
      setLoading(false)
    }

    fetchTribute()
  }, [slug])

  const handleSubmit = async (formData: any) => {
    if (!tribute) return

    try {
      const updatedData: Partial<Tribute> = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fechaNacimiento,
        fecha_fallecimiento: formData.fechaFallecimiento,
        ubicacion: formData.ubicacion,
        biografia: formData.biografia,
        es_premium: formData.isPremium,
      }

      if (formData.imagenPrincipal instanceof File) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("tribute-images")
          .upload(`${tribute.id}/${formData.imagenPrincipal.name}`, formData.imagenPrincipal)

        if (uploadError) throw uploadError

        if (uploadData) {
          const { data } = supabase.storage.from("tribute-images").getPublicUrl(uploadData.path)
          updatedData.imagen_principal = data.publicUrl
        }
      }

      const { error } = await supabase.from("tributes").update(updatedData).eq("id", tribute.id)

      if (error) throw error

      alert("Homenaje actualizado con éxito")
      if (onClose) {
        onClose()
      } else {
        // Si no hay onClose, redirigir al usuario
        router.push(`/homenaje/${slug}`)
      }
    } catch (error) {
      console.error("Error updating tribute:", error)
      alert("Error al actualizar el homenaje. Por favor, inténtalo de nuevo.")
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!tribute) {
    return <div>No se encontró el homenaje</div>
  }

  return (
    <div className="bg-surface p-6 rounded-lg max-w-3xl w-full m-4">
      <h2 className="text-2xl font-andika text-primary mb-6">Editar Homenaje</h2>
      <TributeFormBase
        initialData={{
          nombre: tribute.nombre,
          fechaNacimiento: tribute.fecha_nacimiento,
          fechaFallecimiento: tribute.fecha_fallecimiento,
          ubicacion: tribute.ubicacion || "",
          biografia: tribute.biografia || "",
          imagenPrincipal: null,
          isPremium: tribute.es_premium,
        }}
        onSubmit={handleSubmit}
        buttonText="Guardar Cambios"
        userCredits={userCredits}
        onBuyCredit={() => {
          console.log("Buying credit")
        }}
      />
    </div>
  )
}

