"use client"

import { useState, useEffect } from "react"
import ProfileData from "./ProfileData"
import { AuthProvider } from "../auth/AuthProvider"
import { CreditManager } from "../components/credits/CreditManager"
import { supabase } from "../lib/supabase"

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ProfileData />
          {userId && (
            <div className="mb-8">
              <CreditManager userId={userId} />
            </div>
          )}
        </div>
      </div>
    </AuthProvider>
  )
}

