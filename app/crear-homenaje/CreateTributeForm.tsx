"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth/AuthProvider"
import { supabase } from "../lib/supabase"
import { TributeFormBase } from "../components/tributes/TributeFormBase"
import { slugify } from "../utils/slugify"
import { PaymentDialog } from "../components/payments/PaymentDialog"

async function generateUniqueSlug(name: string, birthDate: string, deathDate: string) {
  const baseSlug = slugify(`${name}-${birthDate}-${deathDate}`)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const { data, error } = await supabase.from("tributes").select("id").eq("slug", slug).single()

    if (error || !data) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export function CreateTributeForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const [userCredits, setUserCredits] = useState(0)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const handleSubmit = async (formData: any) => {
    if (!user) {
      console.error("Usuario no autenticado")
      alert("Debes iniciar sesión para crear un homenaje")
      return
    }
    setLoading(true)
    try {
      let imagenUrl = null
      if (formData.imagenPrincipal instanceof File) {
        const fileExt = formData.imagenPrincipal.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("storage")
          .upload(`tribute-images/${fileName}`, formData.imagenPrincipal, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error("Error al subir la imagen:", uploadError)
          throw uploadError
        }

        if (uploadData) {
          const { data } = supabase.storage.from("storage").getPublicUrl(`tribute-images/${fileName}`)
          imagenUrl = data.publicUrl
        }
      }

      const slug = await generateUniqueSlug(formData.nombre, formData.fechaNacimiento, formData.fechaFallecimiento)

      const newTribute = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fechaNacimiento,
        fecha_fallecimiento: formData.fechaFallecimiento,
        ubicacion: formData.ubicacion,
        biografia: formData.biografia,
        imagen_principal: imagenUrl,
        created_by: user.id,
        slug: slug,
      }

      const { data, error } = await supabase.from("tributes").insert(newTribute).select()

      if (error) {
        console.error("Error al insertar en la base de datos:", error)
        throw error
      }

      console.log("Homenaje creado exitosamente:", data)
      alert("Homenaje creado con éxito")
      router.push(`/homenaje/${slug}`)
    } catch (error) {
      console.error("Error detallado al crear el homenaje:", error)
      alert("Error al crear el homenaje. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // The parent component will handle the redirect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-andika text-primary mb-8 text-center">Crear Nuevo Homenaje</h1>
      <TributeFormBase
        onSubmit={handleSubmit}
        buttonText="Crear Homenaje"
        userCredits={userCredits}
        onBuyCredit={() => setShowPaymentDialog(true)}
      />
      {showPaymentDialog && (
        <PaymentDialog
          planId="premium"
          planName="Homenaje Premium"
          price={12000}
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={() => {
            setUserCredits((prevCredits) => prevCredits + 1)
            setShowPaymentDialog(false)
          }}
          onError={() => {
            console.error("Error en el pago")
          }}
        />
      )}
    </div>
  )
}

