// Importar el tipo User de Supabase
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { ReactNode } from 'react'

// Tipos para las tablas principales
export type User = SupabaseUser & {
  nombre?: string;
  role?: string;
  is_banned?: boolean;
}

// O extender el tipo User de Supabase si necesitas campos adicionales
export type ExtendedUser = SupabaseUser & {
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
  nombre: string;
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
  ubicacion?: string;
  biografia?: string;
  imagen_principal?: string;
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
  user: User;
  profile: Profile;
}

// Tipo para CTAButton
export interface CTAButtonProps {
  href: string;
  className?: string;
  children: ReactNode;
}

// Tipo para TributeCard
export interface TributeCardProps {
  id: string;
  slug: string;
  nombre: string;
  fechaNacimiento: string;
  fechaFallecimiento: string;
  imagen: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Tipo para FeatureCard
export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Tipo para PaymentDialog
export interface PaymentDialogProps {
  planId: string;
  planName: string;
  price: number;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Tipo para ShareButton
export interface ShareButtonProps {
  tributeSlug: string;
  tributeName: string;
  className?: string;
}

// Tipo para BackgroundMusic
export interface BackgroundMusicProps {
  tributeId: string;
  canEdit: boolean;
}

export interface PhotoGalleryProps {
  photos: Photo[]; // Asumiendo que 'Photo' ya está definido en tu archivo de tipos
  onDelete: (photoId: string) => void; // Función para manejar la eliminación de fotos
  onEdit: (photoId: string) => void; // Función para manejar la edición de fotos
} 