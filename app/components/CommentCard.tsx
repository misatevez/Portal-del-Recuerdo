import React from "react"
import { Comment } from "../types"

// Definir el tipo localmente
interface CommentCardProps {
  comment: Comment;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CommentCard({ /* props */ }: CommentCardProps) {
  // Implementación del componente
} 