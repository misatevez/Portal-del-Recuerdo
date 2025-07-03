"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Edit, Trash2, Star, Calendar, MapPin, Info } from "lucide-react"
import { ShareButton } from "../../components/sharing/ShareButton"
import { CommentSection } from "../../components/tributes/CommentSection"
import { useAuth } from "../../auth/AuthProvider"
import { CandleSection } from "../../components/tributes/CandleSection"

import { PhotoGallery } from "../../components/tributes/PhotoGallery"
import { BackgroundMusic } from "../../components/tributes/BackgroundMusic"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"
import type { Tribute as BaseTribute, Comment, Photo, Candle } from "../../types"
import type { User } from "../../auth/AuthProvider"

// Extend the base Tribute type to include our new property
interface Tribute extends BaseTribute {
  is_featured?: boolean;
}

interface TributeContentProps {
  tribute: Tribute
  user: User | null
  candles: Candle[]
  photos: Photo[]
  comments: Comment[]
  setUserCredits: (credits: number) => void
}

export function TributeContent({ tribute, user, candles: initialCandles, photos, comments, setUserCredits }: TributeContentProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments || [])
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos || [])
  const [isOwner, setIsOwner] = useState(false)
  const [isPremium, setIsPremium] = useState(tribute.es_premium || false)
  const router = useRouter()

  const [isFeatured, setIsFeatured] = useState(tribute.is_featured || false)
  const commentsSectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
    setIsOwner(user?.id === tribute.created_by)
  }, [user, tribute.created_by])

  // Añadir un nuevo useEffect para cargar todos los comentarios
  useEffect(() => {
    // Cargar todos los comentarios del homenaje
    const loadComments = async () => {
      try {
        console.log("Cargando comentarios para el homenaje:", tribute.id);
        
        const { data, error } = await supabase
          .from("comments")
          .select("*, profiles:user_id(nombre)")
          .eq("tribute_id", tribute.id);
            
        if (error) throw error;
        
        console.log("Comentarios encontrados:", data?.length || 0);
        
        if (data && data.length > 0) {
          // Reemplazar completamente el estado de comentarios con los datos actualizados
          setLocalComments(data);
        }
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
      }
    };
    
    loadComments();
  }, [tribute.id]); // Solo depende del ID del homenaje

  const handleAddComment = (newComment: any) => {
    // Comprobar si es una acción de eliminación
    if (newComment.action === "delete") {
      setLocalComments(prevComments => prevComments.filter(c => c.id !== newComment.id))
      return
    }
    
    // Comportamiento normal para añadir/actualizar comentarios
    setLocalComments(prevComments => {
      // Verificar si el comentario ya existe
      const exists = prevComments.some(c => c.id === newComment.id)
      
      if (exists) {
        // Si existe, actualizar su estado
        return prevComments.map(c => 
          c.id === newComment.id ? newComment : c
        )
      } else {
        // Si no existe, añadirlo
        return [...prevComments, newComment]
      }
    })
  }

  

  const handleScrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handlePhotoUpload = async (file: File) => {
    try {
      // Verificar si el homenaje es premium
      if (!isPremium) {
        toast.error("Necesitas un homenaje premium para añadir fotos", { duration: 5000 })
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${tribute.id}_${Date.now()}.${fileExt}`
      const filePath = `tribute_images/${tribute.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("storage")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      if (uploadData) {
        const { data } = supabase.storage.from("storage").getPublicUrl(uploadData.path)

        const { data: photoData, error: photoError } = await supabase
          .from("photos")
          .insert({
            tribute_id: tribute.id,
            url: data.publicUrl,
            descripcion: "",
          })
          .select()
          .single()

        if (photoError) throw photoError

        setLocalPhotos((prevPhotos) => [...prevPhotos, photoData])
        toast.success("Foto subida correctamente")
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Error al subir la foto. Intenta de nuevo.")
    }
  }

  const handlePhotoDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      try {
        const { error } = await supabase.from("photos").delete().eq("id", id)
        if (error) throw error
        setLocalPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id))
        toast.success("Foto eliminada correctamente")
      } catch (error) {
        console.error("Error deleting photo:", error)
        toast.error("Error al eliminar la foto")
      }
    }
  }

  const handleUpdateDescription = async (id: string, description: string) => {
    try {
      const { error } = await supabase.from("photos").update({ descripcion: description }).eq("id", id)

      if (error) throw error

      setLocalPhotos((prevPhotos) =>
        prevPhotos.map((photo) => (photo.id === id ? { ...photo, descripcion: description } : photo)),
      )
      toast.success("Descripción actualizada correctamente")
    } catch (error) {
      console.error("Error updating description:", error)
      toast.error("Error al actualizar la descripción")
    }
  }

  const handleEdit = () => {
    router.push(`/editar-homenaje/${tribute.slug}`)
  }

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este homenaje?")) {
      try {
        const { error } = await supabase.from("tributes").delete().eq("id", tribute.id)
        if (error) throw error
        toast.success("Homenaje eliminado con éxito")
        router.push("/perfil")
      } catch (error) {
        console.error("Error al eliminar el homenaje:", error)
        toast.error("Error al eliminar el homenaje")
      }
    }
  }

  const handleFeatureTribute = async () => {
    if (!user || (user.credits ?? 0) < 1) {
      toast.error("No tienes créditos suficientes para destacar este homenaje.");
      return;
    }
    if (isFeatured) {
      toast.error("Este homenaje ya ha sido destacado.");
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres usar 1 crédito para destacar este homenaje? Te quedarán ${(user.credits ?? 0) - 1} créditos.`)) {
      try {
        const { error } = await supabase.rpc('feature_tribute_with_credit', {
          tribute_id_in: tribute.id
        });

        if (error) {
          throw new Error(error.message);
        }

        setIsFeatured(true);
        if (user.credits && setUserCredits) {
          setUserCredits(user.credits - 1);
        }

        toast.success("¡Homenaje destacado con éxito!");

      } catch (error: any) {
        console.error("Error al destacar el homenaje:", error);
        toast.error(error.message || "No se pudo destacar el homenaje.");
      }
    }
  };

  const handleTogglePremium = async () => {
    // TODO: Implement premium status toggle logic
    console.log("Toggle premium status")
  }

  // Añadir función para manejar la eliminación de velas
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tribute Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden">
            <img
              src={tribute.imagen_principal || "/placeholder.svg"}
              alt={tribute.nombre}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-andika text-primary mb-2 flex items-center gap-2">
            {tribute.nombre}
            {isFeatured && (
              <div className="p-1 bg-yellow-400/20 rounded-full" title="Homenaje Destacado">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
            )}
          </h1>
            <div className="flex items-center gap-4 text-text/60 font-montserrat">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(tribute.fecha_nacimiento).getFullYear()} -{" "}
                {new Date(tribute.fecha_fallecimiento).getFullYear()}
              </span>
              {tribute.ubicacion && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tribute.ubicacion}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">

          {isOwner && (
            <>
              <button onClick={handleEdit} className="text-text/60 hover:text-primary" aria-label="Edit tribute">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={handleDelete} className="text-red-500 hover:text-red-700" aria-label="Delete tribute">
                <Trash2 className="w-5 h-5" />
              </button>
              {!isFeatured && (
                <button
                  onClick={handleFeatureTribute}
                  className="text-yellow-500 hover:text-yellow-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                  aria-label="Destacar homenaje"
                  disabled={!user || (user.credits ?? 0) < 1}
                  title={user && (user.credits ?? 0) > 0 ? "Destacar con 1 crédito" : "No tienes créditos suficientes"}
                >
                  <Star className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tribute Biography */}
      <div className="prose max-w-none mb-8">
        <p className="text-text/80 font-montserrat">{tribute.biografia}</p>
      </div>

      {/* Candle Section */}
      <CandleSection 
        initialCandles={initialCandles}
        tributeId={tribute.id}
        tributeAuthorId={tribute.created_by}
      />

      {/* Tribute Actions */}
      <div className="flex flex-wrap gap-4 mb-12">

        <button
          onClick={handleScrollToComments}
          className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-text rounded-md hover:bg-primary/10"
        >
          <MessageCircle className="w-5 h-5" />
          Dejar Mensaje
        </button>
      </div>



      {/* Photo Gallery */}
      {(isOwner || isPremium) && (
        <PhotoGallery
          photos={localPhotos}
          canEdit={isOwner}
          onUpload={handlePhotoUpload}
          onDelete={handlePhotoDelete}
          isPremium={isPremium}
          photoLimit={isPremium ? null : 0}
        />
      )}

      {/* Background Music - solo mostrar si es premium */}
      {isPremium ? (
        <div className="mb-16">
          <BackgroundMusic tributeId={tribute.id} canEdit={isOwner} />
        </div>
      ) : (
        isOwner && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-andika text-primary">Música de Fondo</h2>
            </div>
            <div className="p-4 bg-primary/10 rounded-md">
              <p className="font-montserrat text-sm flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary" />
                La música de fondo es una característica exclusiva para homenajes premium. 
                Actualiza tu homenaje a premium para añadir música de fondo.
              </p>
            </div>
          </section>
        )
      )}

      {/* Comment Section */}
      <div ref={commentsSectionRef}>
        <CommentSection
          comments={localComments}
          tributeId={tribute.id}
          onCommentAdded={handleAddComment}
          user={user}
          isOwner={isOwner}
        />
      </div>


    </div>
  )
}

