// Tipos para las tablas principales
export type User = {
  id: string;
  email: string;
  role?: string;
  is_banned?: boolean;
}

export type Profile = {
  id: string;
  user_id: string;
  nombre: string;
  is_banned?: boolean;
  created_at: string;
  updated_at: string;
}

export type Tribute = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_nacimiento?: string;
  fecha_fallecimiento?: string;
  slug: string;
  user_id: string;
  is_premium: boolean;
  premium_until?: string;
  created_at: string;
  updated_at: string;
  imagen_url?: string;
}

export type Comment = {
  id: string;
  contenido: string;
  user_id: string;
  tribute_id: string;
  created_at: string;
  estado_check: "pendiente" | "aprobado" | "rechazado";
  profiles?: {
    nombre: string;
  };
}

export type Photo = {
  id: string;
  tribute_id: string;
  url: string;
  descripcion?: string;
  created_at: string;
  user_id: string;
}

export type Candle = {
  id: string;
  tribute_id: string;
  user_id: string;
  mensaje?: string;
  created_at: string;
}

export type UserCredit = {
  id: string;
  user_id: string;
  created_at: string;
  used_at?: string;
  tribute_id?: string;
}

// Tipos para props de componentes
export interface ProfileContentProps {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
} 