"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { TributeFormBase } from "./TributeFormBase"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface EditTributeFormProps {
  slug: string
  onClose: () => void
}

export function EditTributeForm({ slug, onClose }: EditTributeFormProps) {
  const [tribute, setTribute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userCredits, setUserCredits] = useState(0)
  const router = useRouter()

  useEffect(() => {
    loadTributeData()
  }, [slug])

  const loadTributeData = async () => {
    try {
      const { data, error } = await supabase
        .from("tributes")
        .select("*")
        .eq("slug", slug)
        .single()

      if (error) throw error
      setTribute(data)
    } catch (error) {
      console.error("Error loading tribute:", error)
      toast.error("Error al cargar el homenaje")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    if (!tribute) return

    try {
      const updatedData: any = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fechaNacimiento,
        fecha_fallecimiento: formData.fechaFallecimiento,
        biografia: formData.biografia,
        is_premium: formData.isPremium,
        ubicacion: formData.ubicacion
      }

      // Manejar la subida de imagen si hay una nueva
      if (formData.imagenPrincipal instanceof File) {
        const fileExt = formData.imagenPrincipal.name.split('.').pop()
        const fileName = `${tribute.id}_${Date.now()}.${fileExt}`
        const filePath = `tribute_images/${tribute.id}/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("storage")
          .upload(filePath, formData.imagenPrincipal, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error("Error al subir la imagen:", uploadError)
          toast.error("Error al subir la imagen")
          return
        }

        const { data } = supabase.storage
          .from("storage")
          .getPublicUrl(uploadData.path)

        updatedData.imagen_principal = data.publicUrl
      }

      const { error } = await supabase
        .from("tributes")
        .update(updatedData)
        .eq("id", tribute.id)

      if (error) throw error

      toast.success("Homenaje actualizado correctamente")
      onClose()
    } catch (error) {
      console.error("Error al actualizar el homenaje:", error)
      toast.error("Error al actualizar el homenaje")
    }
  }

  if (loading) return <div>Cargando...</div>
  if (!tribute) return null

  return (
    <TributeFormBase
      initialData={{
        id: tribute.id,
        nombre: tribute.nombre,
        fechaNacimiento: tribute.fecha_nacimiento,
        fechaFallecimiento: tribute.fecha_fallecimiento,
        ubicacion: tribute.ubicacion || "",
        biografia: tribute.biografia || "",
        imagenPrincipal: null,
        isPremium: tribute.is_premium,
      }}
      currentImageUrl={tribute.imagen_principal}
      onSubmit={handleSubmit}
      buttonText="Guardar Cambios"
      userCredits={userCredits}
      onBuyCredit={() => router.push("/comprar-credito")}
      isEditing={true}
      slug={slug}
    />
  )
}

