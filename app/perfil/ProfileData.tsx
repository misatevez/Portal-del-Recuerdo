"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { ProfileContent } from "./ProfileContent"
import type { Profile, Tribute, User } from "../types"

export default function ProfileData() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [tributesData, setTributesData] = useState<Tribute[]>([])
  const [activityData, setActivityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener la sesión del usuario
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login")
        return
      }
      setUser(session.user)
    })

    // Suscribirse a cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login")
        return
      }
      setUser(session.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        // Cargar perfil
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error al cargar el perfil:", profileError)
          return
        }

        if (profile) {
          setProfileData(profile)
        }

        // Cargar homenajes
        const { data: tributes, error: tributesError } = await supabase
          .from("tributes")
          .select(`
            *,
            candles(count)
          `)
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        if (tributesError) {
          console.error("Error al cargar los homenajes:", tributesError)
        } else {
          setTributesData(tributes || [])
        }

        // Cargar actividad reciente
        const { data: activity, error: activityError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (activityError) {
          console.error("Error al cargar la actividad reciente:", activityError)
        } else {
          setActivityData(activity || [])
        }
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="elegant-card p-8 rounded-lg text-center">
          <h2 className="text-2xl font-andika text-primary mb-4">Acceso no autorizado</h2>
          <p className="text-text/80 font-montserrat mb-6">Por favor, inicia sesión para ver tu perfil.</p>
          <button onClick={() => router.push("/login")} className="elegant-button px-6 py-2 rounded-md font-andika">
            Iniciar Sesión
          </button>
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
      profile={profileData || { id: user.id, nombre: "Usuario" } as Profile}
      tributes={tributesData}
      activity={activityData}
      userCredits={0}
    />
  )
}

