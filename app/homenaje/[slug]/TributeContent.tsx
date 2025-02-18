"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PhotoGallery } from "../../components/tributes/PhotoGallery"
import { EditTributeForm } from "../../components/tributes/EditTributeForm"
import { BackgroundMusic } from "../../components/tributes/BackgroundMusic"
import { TributeHeader } from "../../components/tributes/TributeHeader"
import { TributeBiography } from "../../components/tributes/TributeBiography"
import { TributeActions } from "../../components/tributes/TributeActions"
import { CandleSection } from "../../components/tributes/CandleSection"
import { CommentSection } from "../../components/tributes/CommentSection"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "../../lib/supabase"
import type { Tribute, User, Comment, Candle } from "../../types"

interface TributeContentProps {
  tribute: Tribute
  user: User | null
}

export function TributeContent({ tribute: initialTribute, user }: TributeContentProps) {
  const [showCandleDialog, setShowCandleDialog] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentTribute, setCurrentTribute] = useState<Tribute>(initialTribute)
  const router = useRouter()

  const isOwner = user?.id === currentTribute.created_by

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este homenaje?")) {
      try {
        const { error } = await supabase.from("tributes").delete().eq("id", currentTribute.id)
        if (error) throw error
        toast.success("Homenaje eliminado con éxito")
        router.push("/perfil")
      } catch (error) {
        console.error("Error al eliminar el homenaje:", error)
        toast.error("Error al eliminar el homenaje")
      }
    }
  }

  const handleEdit = async (updatedData: Partial<Tribute>) => {
    try {
      const { error } = await supabase.from("tributes").update(updatedData).eq("id", currentTribute.id)
      if (error) throw error
      setCurrentTribute({ ...currentTribute, ...updatedData })
      toast.success("Homenaje actualizado con éxito")
      setShowEditForm(false)
    } catch (error) {
      console.error("Error al actualizar el homenaje:", error)
      toast.error("Error al actualizar el homenaje")
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setCurrentTribute((prevTribute) => ({
      ...prevTribute,
      comments: [...(prevTribute.comments || []), newComment],
    }))
  }

  const handleCandleLit = (newCandle: Candle) => {
    setCurrentTribute((prevTribute) => ({
      ...prevTribute,
      candles: {
        count: (prevTribute.candles?.count || 0) + 1,
      },
    }))
    toast.success("Vela encendida con éxito")
    setShowCandleDialog(false)
  }

  const handleUpdatePremiumStatus = async (esPremium: boolean) => {
    try {
      const { error } = await supabase.from("tributes").update({ es_premium: esPremium }).eq("id", currentTribute.id)
      if (error) throw error
      setCurrentTribute({ ...currentTribute, es_premium: esPremium })
      toast.success(esPremium ? "Homenaje actualizado a premium" : "Homenaje cambiado a estándar")
    } catch (error) {
      console.error("Error al actualizar el estado premium:", error)
      toast.error("Error al actualizar el estado del homenaje")
    }
  }

  const handleBuyCredit = () => {
    // Implement credit purchase logic here
    console.log("Buying credit")
    // You might want to show a payment dialog or redirect to a payment page
  }

  const scrollToComments = () => {
    document.getElementById("comentarios")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="elegant-card rounded-lg shadow-lg p-8 mt-20">
          <TributeHeader
            tribute={currentTribute}
            isOwner={isOwner}
            onEdit={() => setShowEditForm(true)}
            onDelete={handleDelete}
            onUpdatePremiumStatus={handleUpdatePremiumStatus}
            onBuyCredit={handleBuyCredit}
          />

          <TributeBiography biografia={currentTribute.biografia} />

          <TributeActions
            onLightCandle={() => setShowCandleDialog(true)}
            onScrollToComments={scrollToComments}
            slug={currentTribute.slug}
            name={currentTribute.nombre}
          />

          {currentTribute.photos && currentTribute.photos.length > 0 && (
            <PhotoGallery
              photos={currentTribute.photos}
              canEdit={isOwner}
              onUpload={(file: File) => {
                // Implement photo upload logic
                console.log("Uploading file:", file)
              }}
              onDelete={(id: string) => {
                // Implement photo delete logic
                console.log("Deleting photo with id:", id)
              }}
              onUpdateDescription={(id: string, description: string) => {
                // Implement photo description update logic
                console.log("Updating description for photo:", id, description)
              }}
            />
          )}

          <CandleSection candles={currentTribute.candles} tributeId={currentTribute.id} />

          <CommentSection
            comments={currentTribute.comments || []}
            tributeId={currentTribute.id}
            user={user}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </div>

      <BackgroundMusic tributeId={currentTribute.id} canEdit={isOwner} />

      {showEditForm && <EditTributeForm slug={currentTribute.slug} onClose={() => setShowEditForm(false)} />}

      <Toaster />
    </div>
  )
}

