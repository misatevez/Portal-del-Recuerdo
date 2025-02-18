"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "../../lib/supabase"
import type { Comment, User } from "../../types"

interface CommentSectionProps {
  comments: Comment[]
  tributeId: string
  onCommentAdded: (newComment: Comment) => void
  user: User | null
}

export function CommentSection({ comments, tributeId, onCommentAdded, user }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        })
        .select("*, profiles:user_id(nombre)")
        .single()

      if (error) throw error

      setNewComment("")
      onCommentAdded(data as Comment)
    } catch (err) {
      console.error("Error al añadir comentario:", err)
      alert("Error al publicar el comentario")
    } finally {
      setIsSubmitting(false)
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

      <div className="space-y-6">
        {comments.map((comment) => (
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
        ))}
      </div>
    </section>
  )
}

