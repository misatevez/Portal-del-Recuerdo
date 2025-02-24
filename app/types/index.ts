export interface Comment {
  id: string
  contenido: string
  created_at: string
  user_id: string
  tribute_id: string
  estado_check: "pendiente" | "aprobado" | "rechazado"
  profiles: {
    nombre: string
  }
}

