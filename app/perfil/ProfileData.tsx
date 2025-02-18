"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProfileContent } from "./ProfileContent"
import { useAuth } from "../auth/AuthProvider"

interface Profile {
  nombre: string
  notificaciones?: boolean
  privacidad?: "public" | "private"
  id: string
}

interface Tribute {
  id: string
  slug: string
  nombre: string
  fecha_nacimiento: string
  fecha_fallecimiento: string
  imagen_principal?: string
  candles?: { count: number }
  created_by: string
  es_premium: boolean
  estado: "borrador" | "publicado"
}

interface Activity {
  id: string
  tipo: string
  mensaje: string
  created_at: string
}

export default function ProfileData() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [tributesData, setTributesData] = useState<Tribute[]>([])
  const [activityData, setActivityData] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        const { data: tributes } = await supabase
          .from("tributes")
          .select(`
            *,
            candles: candles(count)
          `)
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        const processedTributes =
          tributes?.map((tribute) => ({
            ...tribute,
            candles: tribute.candles ? tribute.candles[0] : { count: 0 },
          })) || []

        setTributesData(processedTributes)

        const { data: activity } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        setProfileData(profile || { id: user.id, nombre: user.user_metadata.nombre || "Usuario" })
        setActivityData(activity || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [user, supabase])

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="elegant-card p-8 rounded-lg text-center">
          <h2 className="text-2xl font-andika text-primary mb-4">Acceso no autorizado</h2>
          <p className="text-text/80 font-montserrat mb-6">Por favor, inicia sesión para ver tu perfil.</p>
          <a href="/login" className="elegant-button px-6 py-2 rounded-md font-andika">
            Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <ProfileContent
      user={user}
      profile={profileData || { id: user?.id || "", nombre: "Usuario" }}
      tributes={tributesData}
      activity={activityData}
      userCredits={0}
    />
  )
}

