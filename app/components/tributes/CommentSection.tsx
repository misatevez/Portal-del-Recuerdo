"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { supabase } from "../../lib/supabase"
import type { Comment, User } from "../../types"
import toast from "react-hot-toast"

interface CommentSectionProps {
  comments: Comment[]
  tributeId: string
  onCommentAdded: (newComment: Comment) => void
  user: User | null
  isOwner?: boolean
}

export function CommentSection({ comments, tributeId, onCommentAdded, user, isOwner }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Separar comentarios pendientes y aprobados
  const pendingComments = comments.filter((comment) => comment.estado_check === "pendiente")
  const approvedComments = comments.filter((comment) => comment.estado_check === "aprobado")

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          tribute_id: tributeId,
          user_id: user.id,
          contenido: newComment.trim(),
          estado_check: "pendiente",
        })
        .select("*, profiles:user_id(nombre)")
        .single()

      if (error) throw error

      setNewComment("")
      onCommentAdded(data as Comment)
      toast.success("Tu comentario ha sido enviado y está pendiente de aprobación")
    } catch (err) {
      console.error("Error al añadir comentario:", err)
      toast.error("Error al publicar el comentario")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from("comments").update({ estado_check: "aprobado" }).eq("id", commentId)

      if (error) throw error

      // Actualizar el estado local
      const updatedComment = pendingComments.find((c) => c.id === commentId)
      if (updatedComment) {
        onCommentAdded({ ...updatedComment, estado_check: "aprobado" })
      }

      toast.success("Comentario aprobado")
    } catch (error) {
      console.error("Error al aprobar el comentario:", error)
      toast.error("Error al aprobar el comentario")
    }
  }

  const handleRejectComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from("comments").update({ estado_check: "rechazado" }).eq("id", commentId)

      if (error) throw error

      // Remover el comentario de la lista
      const updatedComments = comments.filter((c) => c.id !== commentId)
      onCommentAdded(updatedComments[0]) // Trigger update of parent state

      toast.success("Comentario rechazado")
    } catch (error) {
      console.error("Error al rechazar el comentario:", error)
      toast.error("Error al rechazar el comentario")
    }
  }

  return (
    <section
      id="comentarios"
      className="mb-12 bg-gradient-to-br from-surface to-primary/10 rounded-lg p-8 border border-primary/20"
    >
      <h2 className="text-3xl font-andika text-primary mb-8 text-center relative">
        <span className="relative z-10">Mensajes y Recuerdos</span>
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></span>
      </h2>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comparte un recuerdo o mensaje..."
            className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
            rows={4}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="elegant-button px-4 py-2 rounded-md disabled:opacity-50 font-andika"
            >
              {isSubmitting ? "Publicando..." : "Publicar Mensaje"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-surface rounded-lg text-center shadow-md">
          <p className="text-text/80 font-montserrat mb-2">
            {user === null ? "Por favor, inicia sesión para comentar." : "Cargando estado de usuario..."}
          </p>
          {user === null && (
            <Link href="/login" className="text-text/80 font-montserrat hover:text-primary">
              Iniciar sesión
            </Link>
          )}
        </div>
      )}

      {/* Sección de comentarios pendientes (solo visible para el dueño) */}
      {isOwner && pendingComments.length > 0 && (
        <div className="mb-8 p-6 bg-surface/50 rounded-lg border border-yellow-500/20">
          <h3 className="text-xl font-andika text-primary/80 mb-4 flex items-center">
            <span className="mr-2">🔄</span>
            Comentarios Pendientes ({pendingComments.length})
          </h3>
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-background/90 p-6 rounded-lg shadow-sm border-l-4 border-yellow-500/50 transition-all"
              >
                <p className="text-text/80 mb-4 font-montserrat italic">{comment.contenido}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text/60 font-montserrat">
                    <span className="font-semibold">{comment.profiles.nombre}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveComment(comment.id)}
                      className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 rounded-full"
                      title="Aprobar comentario"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectComment(comment.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-full"
                      title="Rechazar comentario"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de comentarios aprobados */}
      <div className="space-y-6">
        {approvedComments.length === 0 ? (
          <div className="text-center py-8 text-text/60 font-montserrat">
            No hay comentarios aún. ¡Sé el primero en dejar un mensaje!
          </div>
        ) : (
          approvedComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-background/90 p-6 rounded-lg shadow-sm border-l-4 border-primary transition-all hover:bg-background hover:shadow-md hover:scale-[1.01]"
            >
              <p className="text-text/80 mb-4 font-montserrat italic">{comment.contenido}</p>
              <div className="flex items-center justify-between text-sm text-text/60 font-montserrat">
                <span className="font-semibold">{comment.profiles.nombre}</span>
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

