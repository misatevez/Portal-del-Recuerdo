"use client"

import { useState, useEffect } from "react"
import { ProfileContent } from "./ProfileContent"

import { supabase } from "../lib/supabase"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [profileData, tributesData, activityData, creditsData] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("tributes").select("*").eq("created_by", user.id),
          supabase.from("notifications").select("*").eq("user_id", user.id),
          supabase.from("credits").select("amount").eq("user_id", user.id).single()
        ])

        setData({
          user,
          profile: profileData.data || { nombre: "", notificaciones: true, privacidad: "public" },
          tributes: tributesData.data || [],
          activity: activityData.data || [],
          userCredits: creditsData.data?.amount || 0
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading || !data) return null

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProfileContent {...data} />
      </div>
    </div>
  )
}

