"use client"

import { useState, useEffect } from "react"
import { TributeFormBase } from "./TributeFormBase"
import { supabase } from "../../lib/supabase"
import type { Tribute } from "../../types"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

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
        is_premium: formData.isPremium,
      }

      // Comprobar si se ha seleccionado una nueva imagen
      if (formData.imagenPrincipal instanceof File) {
        // Usar el bucket "storage" y la carpeta "tribute_images"
        const bucketName = "storage";
        
        const fileExt = formData.imagenPrincipal.name.split('.').pop();
        const fileName = `${tribute.id}_${Date.now()}.${fileExt}`;
        const filePath = `tribute_images/${tribute.id}/${fileName}`;
        
        console.log("Intentando subir imagen a bucket:", bucketName, "ruta:", filePath);
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, formData.imagenPrincipal, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error("Error al subir la imagen:", uploadError);
            toast.error("No se pudo actualizar la imagen, pero se guardarán los demás cambios");
          } else if (uploadData) {
            const { data } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path);
            console.log("Imagen subida correctamente:", data.publicUrl);
            updatedData.imagen_principal = data.publicUrl;
          }
        } catch (uploadErr) {
          console.error("Error al subir la imagen:", uploadErr);
          toast.error("No se pudo actualizar la imagen, pero se guardarán los demás cambios");
        }
      }

      // Actualizar el homenaje en la base de datos
      const { error } = await supabase.from("tributes").update(updatedData).eq("id", tribute.id);

      if (error) throw error;

      toast.success("Homenaje actualizado con éxito");
      if (onClose) {
        onClose();
      } else {
        router.push(`/homenaje/${slug}`);
      }
    } catch (error) {
      console.error("Error updating tribute:", error);
      toast.error("Error al actualizar el homenaje. Por favor, inténtalo de nuevo.");
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
        currentImageUrl={tribute.imagen_principal || ""}
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

