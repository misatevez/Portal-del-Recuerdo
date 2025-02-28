"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Edit, Trash2, Star, Calendar, MapPin, Info } from "lucide-react"
import { ShareButton } from "../../components/sharing/ShareButton"
import { CommentSection } from "../../components/tributes/CommentSection"
import { CandleSection } from "../../components/tributes/CandleSection"
import CandleDialog from "../../components/tributes/CandleDialog"
import { PhotoGallery } from "../../components/tributes/PhotoGallery"
import { BackgroundMusic } from "../../components/tributes/BackgroundMusic"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"
import type { Tribute, User, Comment, Photo } from "../../types"

interface TributeContentProps {
  tribute: Tribute
  user: User | null
}

export function TributeContent({ tribute, user }: TributeContentProps) {
  const [comments, setComments] = useState<Comment[]>(tribute.comments || [])
  const [candles, setCandles] = useState(tribute.candles || [])
  const [pendingCandles, setPendingCandles] = useState<any[]>([])
  const [photos, setPhotos] = useState<Photo[]>(tribute.photos || [])
  const [showCandleDialog, setShowCandleDialog] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isPremium, setIsPremium] = useState(tribute.is_premium || false)
  const router = useRouter()
  const commentsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsOwner(user?.id === tribute.created_by)
  }, [user, tribute.created_by])

  // Cargar velas pendientes cuando el usuario es propietario
  useEffect(() => {
    if (isOwner && user) {
      const loadPendingCandles = async () => {
        try {
          console.log("Cargando velas pendientes para el homenaje:", tribute.id);
          
          // Consulta explícita para velas pendientes
          const { data, error } = await supabase
            .from("candles")
            .select("*, profiles:user_id(nombre)")
            .eq("tribute_id", tribute.id)
            .eq("estado", "pendiente");
            
          if (error) throw error;
          
          console.log("Velas pendientes encontradas:", data?.length || 0);
          console.log("Datos de velas pendientes:", data);
          
          if (data && data.length > 0) {
            // Actualizar directamente el estado de candles con las velas pendientes
            setCandles(prevCandles => {
              // Crear un mapa de IDs existentes para evitar duplicados
              const existingIds = new Set(prevCandles.map(c => c.id));
              // Filtrar solo las velas nuevas
              const newCandles = data.filter(c => !existingIds.has(c.id));
              console.log("Nuevas velas a agregar:", newCandles.length);
              
              // Asegurarse de que el estado de las velas es correcto
              const updatedCandles = [...prevCandles];
              for (const newCandle of newCandles) {
                // Asegurarse de que el estado está correctamente establecido
                newCandle.estado = "pendiente";
                updatedCandles.push(newCandle);
              }
              
              return updatedCandles;
            });
          }
        } catch (error) {
          console.error("Error al cargar velas pendientes:", error);
        }
      };
      
      loadPendingCandles();
    }
  }, [isOwner, user, tribute.id]);

  // Modificar el useEffect que carga las velas pendientes
  useEffect(() => {
    // Cargar todas las velas del homenaje, no solo las pendientes
    const loadCandles = async () => {
      try {
        console.log("Cargando velas para el homenaje:", tribute.id);
        
        const { data, error } = await supabase
          .from("candles")
          .select("*, profiles:user_id(nombre)")
          .eq("tribute_id", tribute.id);
            
        if (error) throw error;
        
        console.log("Velas encontradas:", data?.length || 0);
        console.log("Datos de velas:", data);
        
        if (data && data.length > 0) {
          // Reemplazar completamente el estado de velas con los datos actualizados
          setCandles(data);
        }
      } catch (error) {
        console.error("Error al cargar velas:", error);
      }
    };
    
    loadCandles();
  }, [tribute.id]); // Solo depende del ID del homenaje, no del usuario o isOwner

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
          setComments(data);
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
      setComments(prevComments => prevComments.filter(c => c.id !== newComment.id))
      return
    }
    
    // Comportamiento normal para añadir/actualizar comentarios
    setComments(prevComments => {
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

  const handleLightCandle = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para encender una vela", {
        duration: 3000,
      })
      router.push("/login")
      return
    }
    setShowCandleDialog(true)
  }

  const handleCandleLit = (newCandle: any) => {
    // Agregar la vela a la lista de velas pendientes
    setPendingCandles((prev) => [...prev, newCandle])
    
    // Si el usuario es el propietario del homenaje, también agregar a las velas
    if (isOwner) {
      setCandles((prevCandles) => {
        // Verificar si la vela ya existe en el estado para evitar duplicados
        const exists = prevCandles.some(c => c.id === newCandle.id)
        if (exists) return prevCandles
        return [...prevCandles, newCandle]
      })
    }
  }

  const handleScrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handlePhotoUpload = async (file: File) => {
    try {
      // Verificar si el homenaje es premium o si ya ha alcanzado el límite de fotos gratuitas
      if (!isPremium && photos.length >= 3) {
        toast.error(
          "Has alcanzado el límite de fotos para homenajes gratuitos. Actualiza a premium para subir más fotos.",
          { duration: 5000 }
        )
        return
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("tribute-images")
        .upload(`${tribute.id}/${file.name}`, file)

      if (uploadError) throw uploadError

      if (uploadData) {
        const { data } = supabase.storage.from("tribute-images").getPublicUrl(uploadData.path)

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

        setPhotos((prevPhotos) => [...prevPhotos, photoData])
        toast.success("Foto subida correctamente")
      }
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
        setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id))
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

      setPhotos((prevPhotos) =>
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

  const handleTogglePremium = async () => {
    // TODO: Implement premium status toggle logic
    console.log("Toggle premium status")
  }

  // Añadir función para manejar la eliminación de velas
  const handleCandleDelete = (candleId: string) => {
    setCandles(prevCandles => prevCandles.filter(candle => candle.id !== candleId))
  }

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
            <h1 className="text-3xl font-andika text-primary mb-2">{tribute.nombre}</h1>
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
              <button
                onClick={handleTogglePremium}
                className="text-text/60 hover:text-primary"
                aria-label="Toggle premium status"
              >
                <Star className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tribute Biography */}
      <div className="prose max-w-none mb-8">
        <p className="text-text/80 font-montserrat">{tribute.biografia}</p>
      </div>

      {/* Tribute Actions */}
      <div className="flex flex-wrap gap-4 mb-12">
        <button
          onClick={handleLightCandle}
          className="elegant-button flex items-center gap-2 px-4 py-2 rounded-md"
        >
          <Heart className="w-5 h-5" />
          Encender Vela
        </button>
        <button
          onClick={handleScrollToComments}
          className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-text rounded-md hover:bg-primary/10"
        >
          <MessageCircle className="w-5 h-5" />
          Dejar Mensaje
        </button>
      </div>

      {/* Candle Section */}
      <CandleSection 
        candles={candles} 
        pendingCandles={pendingCandles}
        tributeId={tribute.id} 
        isOwner={isOwner} 
        currentUser={user}
        onCandleDeleted={handleCandleDelete}
      />

      {/* Photo Gallery */}
      {isOwner && (
      <PhotoGallery
        photos={photos}
        canEdit={isOwner}
        onUpload={handlePhotoUpload}
        onDelete={handlePhotoDelete}
        onUpdateDescription={handleUpdateDescription}
        isPremium={isPremium}
        photoLimit={isPremium ? null : 0} // Límite de 3 fotos para homenajes gratuitos, sin límite para premium
      />
      )}

      {/* Background Music - solo mostrar si es premium */}
      {isPremium ? (
        <BackgroundMusic tributeId={tribute.id} canEdit={isOwner} />
      ) : (
        isOwner && (
          <section className="mb-12">
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
          comments={comments}
          tributeId={tribute.id}
          onCommentAdded={handleAddComment}
          user={user}
          isOwner={isOwner}
        />
      </div>

      {showCandleDialog && (
        <CandleDialog onClose={() => setShowCandleDialog(false)} tributeId={tribute.id} onCandleLit={handleCandleLit} />
      )}
    </div>
  )
}

