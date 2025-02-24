"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Edit, Trash2, Star, Calendar, MapPin } from "lucide-react"
import { ShareButton } from "../../components/sharing/ShareButton"
import { CommentSection } from "../../components/tributes/CommentSection"
import { CandleSection } from "../../components/tributes/CandleSection"
import CandleDialog from "../../components/tributes/CandleDialog"
import { PhotoGallery } from "../../components/tributes/PhotoGallery"
import { BackgroundMusic } from "../../components/tributes/BackgroundMusic"
import { supabase } from "../../lib/supabase"
import type { Tribute, User, Comment, Photo } from "../../types"

interface TributeContentProps {
  tribute: Tribute
  user: User | null
}

export function TributeContent({ tribute, user }: TributeContentProps) {
  const [comments, setComments] = useState<Comment[]>(tribute.comments || [])
  const [candles, setCandles] = useState(tribute.candles || [])
  const [photos, setPhotos] = useState<Photo[]>(tribute.photos || [])
  const [showCandleDialog, setShowCandleDialog] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const router = useRouter()
  const commentsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsOwner(user?.id === tribute.created_by)
  }, [user, tribute.created_by])

  const handleAddComment = (newComment: Comment) => {
    setComments((prevComments) => [...prevComments, newComment])
  }

  const handleLightCandle = () => {
    setShowCandleDialog(true)
  }

  const handleCandleLit = (newCandle: any) => {
    setCandles((prevCandles) => [...prevCandles, newCandle])
  }

  const handleScrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handlePhotoUpload = async (file: File) => {
    try {
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
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Error al subir la foto")
    }
  }

  const handlePhotoDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      try {
        const { error } = await supabase.from("photos").delete().eq("id", id)
        if (error) throw error
        setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id))
      } catch (error) {
        console.error("Error deleting photo:", error)
        alert("Error al eliminar la foto")
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
    } catch (error) {
      console.error("Error updating description:", error)
      alert("Error al actualizar la descripción")
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
        alert("Homenaje eliminado con éxito")
        router.push("/perfil")
      } catch (error) {
        console.error("Error al eliminar el homenaje:", error)
        alert("Error al eliminar el homenaje")
      }
    }
  }

  const handleTogglePremium = async () => {
    // TODO: Implement premium status toggle logic
    console.log("Toggle premium status")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tribute Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
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
          <ShareButton
            tributeSlug={tribute.slug}
            tributeName={tribute.nombre}
            className="text-text/60 hover:text-primary"
          />
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
          className={`elegant-button flex items-center gap-2 px-4 py-2 rounded-md ${
            !user ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
      <CandleSection candles={candles} tributeId={tribute.id} isOwner={isOwner} />

      {/* Photo Gallery */}
      <PhotoGallery
        photos={photos}
        canEdit={isOwner}
        onUpload={handlePhotoUpload}
        onDelete={handlePhotoDelete}
        onUpdateDescription={handleUpdateDescription}
      />

      {/* Background Music */}
      <BackgroundMusic tributeId={tribute.id} canEdit={isOwner} />

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

