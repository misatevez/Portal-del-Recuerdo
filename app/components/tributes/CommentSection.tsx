"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { supabase } from "../../lib/supabase"
import type { Comment, User } from "../../types"
import toast from "react-hot-toast"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"

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
  const [forceUpdate, setForceUpdate] = useState(0)

  // Añadir estos estados
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [approvedComments, setApprovedComments] = useState<Comment[]>([])

  // Añadir estados para el diálogo de confirmación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  // Añadir un useEffect para sincronizar los estados locales con las props
  useEffect(() => {
    // Actualizar el estado local cuando cambian las props
    setPendingComments(comments.filter(comment => comment.estado_check === "pendiente"))
    setApprovedComments(comments.filter(comment => comment.estado_check === "aprobado"))
  }, [comments])

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
          estado_check: isOwner ? "aprobado" : "pendiente",
          profiles: { nombre: user.nombre || user.email?.split('@')[0] || 'Usuario' },
        })
        .select("*, profiles:user_id(nombre)")
        .single()

      if (error) throw error

      setNewComment("")
      
      // Si es el propietario, añadir directamente a los comentarios aprobados
      if (isOwner) {
        // Crear una copia completa con el estado correcto
        const newCommentWithProfile = { 
          ...data, 
          estado_check: "aprobado",
          profiles: { nombre: user.nombre || user.email?.split('@')[0] || 'Usuario' }
        };
        
        // Notificar al componente padre con el comentario actualizado
        onCommentAdded(newCommentWithProfile);
        
        // Forzar una actualización del componente
        setForceUpdate(prev => prev + 1);
        
        toast.success("Tu comentario ha sido publicado");
      } else {
        onCommentAdded(data as Comment);
        toast.success("Tu comentario ha sido enviado y está pendiente de aprobación");
      }
    } catch (err) {
      console.error("Error al añadir comentario:", err)
      toast.error("Error al publicar el comentario")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ estado_check: "aprobado" })
        .eq("id", commentId)

      if (error) throw error

      // Actualizar el estado local
      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, estado_check: "aprobado" } 
          : comment
      );
      
      // Encontrar el comentario actualizado
      const updatedComment = updatedComments.find(c => c.id === commentId);
      
      if (updatedComment) {
        // Asegúrate de que estado_check tenga un valor válido
        updatedComment.estado_check = updatedComment.estado_check as "pendiente" | "aprobado" | "rechazado"; // Asegúrate de que el valor sea uno de los permitidos

        // Notificar al componente padre
        onCommentAdded(updatedComment as Comment);
        
        // Forzar una actualización del componente
        setForceUpdate(prev => prev + 1);
      }

      toast.success("Comentario aprobado");
    } catch (error) {
      console.error("Error al aprobar el comentario:", error)
      toast.error("Error al aprobar el comentario")
    }
  }

  const handleRejectComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ estado_check: "rechazado" })
        .eq("id", commentId)

      if (error) throw error

      // Actualizar el estado local filtrando el comentario rechazado
      const updatedComments = comments.filter(c => c.id !== commentId);
      
      // Forzar una actualización del componente
      setForceUpdate(prev => prev + 1);
      
      // Notificar al componente padre si hay comentarios
      if (updatedComments.length > 0) {
        // Enviar cualquier comentario para forzar la actualización
        onCommentAdded(updatedComments[0]);
      }

      toast.success("Comentario rechazado");
    } catch (error) {
      console.error("Error al rechazar el comentario:", error)
      toast.error("Error al rechazar el comentario")
    }
  }

  // Modificar la función handleDeleteComment
  const handleDeleteComment = (commentId: string) => {
    // Abrir el diálogo de confirmación y guardar el ID del comentario
    setCommentToDelete(commentId)
    setIsDeleteDialogOpen(true)
  }

  // Añadir una nueva función para realizar la eliminación
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentToDelete)

      if (error) throw error

      // Actualizar el estado local filtrando el comentario eliminado
      const updatedComments = comments.filter(c => c.id !== commentToDelete)
      
      // Actualizar directamente todos los estados relacionados con comentarios
      setPendingComments(prev => prev.filter(c => c.id !== commentToDelete))
      setApprovedComments(prev => prev.filter(c => c.id !== commentToDelete))
      
      // También actualizar el estado principal de comentarios en el componente padre
      onCommentAdded({ id: commentToDelete, action: "delete" } as any)
      
      // Forzar una actualización del componente
      setForceUpdate(prev => prev + 1)

      toast.success("Comentario eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar el comentario:", error)
      toast.error("Error al eliminar el comentario")
    } finally {
      // Limpiar el ID del comentario
      setCommentToDelete(null)
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
                    <span className="font-semibold">{comment.profiles ? comment.profiles.nombre : 'Nombre no disponible'}</span>
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
              className="bg-background/90 p-6 rounded-lg shadow-sm border-l-4 border-primary transition-all hover:bg-background hover:shadow-md hover:scale-[1.01] relative"
            >
              {/* Botón de eliminar para el propietario */}
              {isOwner && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="absolute top-2 right-2 p-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-full"
                  title="Eliminar comentario"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <p className="text-text/80 mb-4 font-montserrat italic">{comment.contenido}</p>
              <div className="flex items-center justify-between text-sm text-text/60 font-montserrat">
                <span className="font-semibold">{comment.profiles ? comment.profiles.nombre : 'Nombre no disponible'}</span>
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Diálogo de confirmación para eliminar comentarios */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Eliminar comentario"
        message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </section>
  )
}

