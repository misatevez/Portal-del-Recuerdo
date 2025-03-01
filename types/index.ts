import type { User as SupabaseUser } from "@supabase/supabase-js"
import type React from "react"

export interface User extends SupabaseUser {
  // Add any additional properties specific to your User type
  // For example:
  // customProperty?: string;
}

export interface Profile {
  id: string
  nombre: string
  notificaciones?: boolean
  privacidad?: "public" | "private"
}

export interface Tribute {
  id: string
  slug: string
  nombre: string
  fecha_nacimiento: string
  fecha_fallecimiento: string
  ubicacion?: string
  biografia?: string
  imagen_principal?: string
  created_by: string
  es_premium: boolean
  estado: "borrador" | "publicado"
  comments?: Comment[]
  candles?: Candle[]
  photos?: Photo[]
}

export interface Comment {
  id: string
  contenido: string
  created_at: string
  user_id: string
  tribute_id: string
  profiles: {
    nombre: string
  }
}

export interface Candle {
  id: string
  mensaje?: string
  user_id: string
  tribute_id: string
  profiles: {
    nombre: string
  }
}

export interface Photo {
  id: string
  url: string
  descripcion: string
  tribute_id: string
}

export interface PremiumCredit {
  id: string
  user_id: string
  tribute_id: string
  credits: number
  premium_start_date: string
  premium_end_date: string
}

export interface PaymentDialogProps {
  planId: string
  planName: string
  price: number
  onClose: () => void
  onSuccess: () => void
}

export interface TributeFormBaseProps {
  initialData?: {
    nombre: string
    fechaNacimiento: string
    fechaFallecimiento: string
    ubicacion: string
    biografia: string
    imagenPrincipal: File | null
    isPremium?: boolean
  }
  onSubmit: (formData: any) => Promise<void>
  buttonText: string
  userCredits: number
  onBuyCredit: () => void
}

export interface TributeHeaderProps {
  tribute: Tribute
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  onUpdatePremiumStatus: (esPremium: boolean) => void
  onBuyCredit: () => void
}

export interface TributeBiographyProps {
  biografia?: string
}

export interface TributeActionsProps {
  onLightCandle: () => void;
  onScrollToComments: () => void;
  slug: string;
  name: string;
}

export interface CandleSectionProps {
  candles: Candle[]
  tributeId: string
}

export interface PhotoGalleryProps {
  photos: Photo[]
  canEdit: boolean
  onUpload: (file: File) => void
  onDelete: (id: string) => void
  onUpdateDescription: (id: string, description: string) => void
}

export interface BackgroundMusicProps {
  tributeId: string
  canEdit: boolean
}

export interface ShareButtonProps {
  tributeSlug: string
  tributeName: string
  className?: string
}

export interface CTAButtonProps {
  href: string
  className?: string
  children: React.ReactNode
}

export interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export interface ProfileContentProps {
  user: User
  profile: Profile
  tributes: Tribute[]
  activity: any[] // Podríamos definir un tipo más específico para la actividad si es necesario
  userCredits: number
}

export interface SearchFilters {
  year?: string
  location?: string
  sortBy?: "recent" | "candles" | "name"
}

export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface TributeActionsProps {
  onLightCandle: () => void;
  onScrollToComments: () => void;
  slug: string;
  name: string;
}

